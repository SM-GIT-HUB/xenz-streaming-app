import { eq } from "drizzle-orm"
import { headers } from "next/headers"

import { db } from "@/db"
import { mux } from "@/lib/mux"
import { videos } from "@/db/schema"

import { UTApi } from "uploadthing/server"
import { VideoAssetCreatedWebhookEvent, VideoAssetDeletedWebhookEvent, VideoAssetErroredWebhookEvent, VideoAssetReadyWebhookEvent, VideoAssetTrackReadyWebhookEvent } from "@mux/mux-node/resources/webhooks"

type WebhookEvent = 
    | VideoAssetCreatedWebhookEvent
    | VideoAssetReadyWebhookEvent
    | VideoAssetErroredWebhookEvent
    | VideoAssetTrackReadyWebhookEvent
    | VideoAssetDeletedWebhookEvent

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET;

export async function POST(req: Request)
{
    if (!SIGNING_SECRET) {
        throw new Error("MUX_WEBHOOK_SECRET is not set");
    }

    const headersPayload = await headers();
    const muxSignature = headersPayload.get("mux-signature");

    if (!muxSignature) {
        return new Response("No signature found", { status: 401 });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    mux.webhooks.verifySignature(
        body, {
            "mux-signature": muxSignature
        },
        SIGNING_SECRET
    )

    switch (payload.type as WebhookEvent["type"]) {
        case "video.asset.created" : {
            const data = payload.data as VideoAssetCreatedWebhookEvent["data"];

            if (!data.upload_id) {
                return new Response("No upload id found", { status: 400 });
            }

            console.log(data.upload_id, "Data uploadid");

            await db.update(videos).set({
                muxAssetId: data.id,
                muxStatus: data.status,
            })
            .where(eq(videos.muxUploadId, data.upload_id));

            console.log("Webhook fired asset created");
            break;
        }

        case "video.asset.ready" : {
            const data = payload.data as VideoAssetReadyWebhookEvent["data"];
            const playbackId = data.playback_ids?.[0].id;

            if (!data.upload_id) {
                return new Response("No upload id found", { status: 400 });
            }
            
            if (!playbackId) {
                return new Response("Missing playback ID", { status: 400 });
            }

            console.log(data.upload_id, "Data uploadid");

            const [video] = await db.select().from(videos).where(eq(videos.muxUploadId, data.upload_id));

            if (!video) {
                return new Response("Video not found", { status: 404 });
            }

            const utapi = new UTApi();

            const duration = data.duration? Math.round(data.duration * 1000) : 0;
            const tempPreviewUrl = `https://image.mux.com/${playbackId}/animated.gif`;
            const tempThumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.png`;

            let thumbnailKey = video.thumbnailKey;
            let thumbnailUrl = video.thumbnailUrl;
            let previewKey = video.previewKey;
            let previewUrl = video.previewUrl;

            if (!thumbnailKey || !previewKey)
            {
                const [uploadedPreview, uploadedThumbnail] = await utapi.uploadFilesFromUrl([
                    tempPreviewUrl,
                    tempThumbnailUrl
                ])
                
                thumbnailKey = uploadedThumbnail.data?.key || thumbnailKey;
                thumbnailUrl = uploadedThumbnail.data?.url || thumbnailUrl;
                previewKey = uploadedPreview.data?.key || previewKey;
                previewUrl = uploadedPreview.data?.url || previewUrl;
            }
            
            await db.update(videos).set({
                muxStatus: "ready",
                muxPlaybackId: playbackId,
                previewUrl,
                previewKey,
                thumbnailUrl,
                thumbnailKey,
                defaultThumbnailUrl: video.defaultThumbnailUrl || thumbnailUrl,
                defaultThumbnailKey: video.defaultThumbnailKey || thumbnailKey,
                duration
            })
            .where(eq(videos.muxUploadId, data.upload_id))

            console.log("Webhook fired asset ready");
            break;
        }

        case "video.asset.track.ready" : {
            const data = payload.data as VideoAssetTrackReadyWebhookEvent["data"] & {
                asset_id: string;
            }

            const assetId = data.asset_id;
            const trackId = data.id;
            const status = data.status;

            if (!data.asset_id) {
                return new Response('Missing asset ID', { status: 400 });
            }

            await db.update(videos).set({
                muxTrackId: trackId,
                muxTrackStatus: status,
                muxStatus: "ready"
            })
            .where(eq(videos.muxAssetId, assetId))

            console.log("Webhook fired track ready");
            break;
        }

        case "video.asset.errored" : {
            const data = payload.data as VideoAssetErroredWebhookEvent["data"];
            
            if (!data.upload_id) {
                return new Response("No upload id found", { status: 400 });
            }

            console.log(data.upload_id, "Data uploadid");

            await db.update(videos).set({
                muxStatus: data.status
            })
            .where(eq(videos.muxUploadId, data.upload_id));

            console.log("Webhook fired asset errored");
            break;
        }

        case "video.asset.deleted": {
            const data = payload.data as VideoAssetDeletedWebhookEvent["data"];

            if (!data.upload_id) {
                return new Response("No upload id found", { status: 400 });
            }

            console.log(data.upload_id, "Data uploadid");

            const [video] = await db.delete(videos).where(eq(videos.muxUploadId, data.upload_id)).returning();

            if (!video) {
                return new Response("Video not found", { status: 404 });
            }

            const utapi = new UTApi();

            if (video.defaultThumbnailKey) {
                utapi.deleteFiles(video.defaultThumbnailKey);
            }

            if (video.thumbnailKey && video.thumbnailKey != video.defaultThumbnailKey) {
                utapi.deleteFiles(video.thumbnailKey);
            }

            if (video.previewKey) {
                utapi.deleteFiles(video.previewKey);
            }

            console.log("Webhook fired asset deleted");
            break;
        }
    }

    return new Response("Webhook received", { status: 200 });
}