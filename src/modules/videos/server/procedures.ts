import { db } from "@/db"
import { videos, videoUpdateSchema } from "@/db/schema"

import { mux } from "@/lib/mux"
import { and, eq } from "drizzle-orm"

import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { UTApi } from "uploadthing/server"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"

export const videosRouter = createTRPCRouter({
    create: protectedProcedure.mutation(async ({ ctx }) => {
        const { id: userId } = ctx.user;

        const upload = await mux.video.uploads.create({
            new_asset_settings: {
                passthrough: userId,
                playback_policy: ["public"],
                input: [
                    {
                        generated_subtitles: [
                            {
                                language_code: "en",
                                name: "English"
                            }
                        ]
                    }
                ]
            },
            cors_origin: "*"
        })

        const [video] = await db.insert(videos).values({
            userId,
            title: "Nothing",
            muxStatus: "waiting",
            muxUploadId: upload.id
        })
        .returning()

        return { video, url: upload.url };
    }),
    
    update: protectedProcedure.input(videoUpdateSchema).mutation(async ({ ctx, input }) => {
        const { id: userId } = ctx.user;

        if (!input.id) {
            throw new TRPCError({ message: "Video id not found", code: "NOT_FOUND" });
        }

        const [updatedVideo] = await db.update(videos).set({
            title: input.title,
            description: input.description,
            categoryId: input.categoryId,
            visibility: input.visibility,
            updatedAt: new Date()
        })
        .where(and(
            eq(videos.id, input.id),
            eq(videos.userId, userId)
        ))
        .returning()

        if (!updatedVideo) {
            throw new TRPCError({ message: "Video not found", code: "NOT_FOUND" });
        }

        return updatedVideo;
    }),

    restoreThumbnail: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
        const { id: userId } = ctx.user;

        if (!input.id) {
            throw new TRPCError({ message: "Video id not found", code: "NOT_FOUND" });
        }

        const [video] = await db.select().from(videos).where(and(
            eq(videos.id, input.id),
            eq(videos.userId, userId)
        ))

        if (!video) {
            throw new TRPCError({ message: "Video not found", code: "NOT_FOUND" });
        }

        const [updatedVideo] = await db.update(videos).set({
            thumbnailUrl: video.defaultThumbnailUrl,
            thumbnailKey: video.defaultThumbnailKey
        })
        .where(and(
            eq(videos.id, input.id),
            eq(videos.userId, userId)
        ))
        .returning()

        if (!updatedVideo) {
            throw new TRPCError({ message: "Something went wrong", code: "INTERNAL_SERVER_ERROR" });
        }

        if (video.thumbnailKey && video.thumbnailKey != video.defaultThumbnailKey)
        {
            const utapi = new UTApi();
            await utapi.deleteFiles(video.thumbnailKey);
        }

        return updatedVideo;
    }),

    remove: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
        const { id: userId } = ctx.user;

        if (!input.id) {
            throw new TRPCError({ message: "Video id not found", code: "NOT_FOUND" });
        }

        const [video] = await db.select().from(videos).where(and(
            eq(videos.id, input.id),
            eq(videos.userId, userId)
        ))

        if (!video) {
            throw new TRPCError({ message: "Video not found", code: "NOT_FOUND" });
        }

        const thumbnailKey = video.thumbnailKey;
        const previewKey = video.previewKey;

        const [removedVideo] = await db.delete(videos).where(and(
            eq(videos.id, input.id),
            eq(videos.userId, userId)
        ))
        .returning()

        if (!removedVideo) {
            throw new TRPCError({ message: "Something went wrong", code: "INTERNAL_SERVER_ERROR" });
        }

        if (thumbnailKey)
        {
            const utapi = new UTApi();
            utapi.deleteFiles([thumbnailKey]);
        }
        
        if (video.defaultThumbnailKey)
        {
            const utapi = new UTApi();
            utapi.deleteFiles([video.defaultThumbnailKey]);
        }

        if (previewKey)
        {
            const utapi = new UTApi();
            utapi.deleteFiles([previewKey]);
        }

        return removedVideo;
    })
})