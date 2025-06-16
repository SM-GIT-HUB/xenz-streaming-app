import { UploadThingError, UTApi } from "uploadthing/server"
import { createUploadthing, type FileRouter } from "uploadthing/next"

import { db } from "@/db"
import { users, videos } from "@/db/schema"

import { string, z } from "zod"
import { and, eq } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

const f = createUploadthing();

export const ourFileRouter = {
  thumbnailUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
  .input(z.object({
    videoId: z.string().uuid()
  }))
  .middleware(async ({ input }) => {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) throw new UploadThingError("Unauthorized");

    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkUserId));

    if (!user) {
      throw new UploadThingError("Unauthorized");
    }

    const [video] = await db.select().from(videos).where(and(
      eq(videos.id, input.videoId),
      eq(videos.userId, user.id)
    ))

    if (!video) {
      throw new UploadThingError("Video not found");
    }

    return { userId: user.id, video, ...input }; 
  })
  .onUploadComplete(async ({ metadata, file }) => {
    const [updatedVideo] = await db.update(videos).set({
      thumbnailUrl: file.url,
      thumbnailKey: file.key
    })
    .where(and(
      eq(videos.id, metadata.videoId),
      eq(videos.userId, metadata.userId)
    ))
    .returning()

    if (!updatedVideo)
    {
      const utapi = new UTApi();
      await utapi.deleteFiles(file.key);
      throw new UploadThingError("Something went wrong");
    }

    if (metadata.video.thumbnailKey && metadata.video.thumbnailKey != metadata.video.defaultThumbnailKey)
    {
      const utapi = new UTApi();
      await utapi.deleteFiles(metadata.video.thumbnailKey);
    }

    return { uploadedBy: metadata.userId };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
