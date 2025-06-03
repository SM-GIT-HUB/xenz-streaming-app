import { UploadThingError } from "uploadthing/server"
import { createUploadthing, type FileRouter } from "uploadthing/next"

import { db } from "@/db"
import { string, z } from "zod"
import { users, videos } from "@/db/schema"
import { auth } from "@clerk/nextjs/server"
import { and, eq } from "drizzle-orm"

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

    return { userId: user.id, ...input };
  })
  .onUploadComplete(async ({ metadata, file }) => {
    await db.update(videos).set({
      thumbnailUrl: file.url
    })
    .where(and(
      eq(videos.id, metadata.videoId),
      eq(videos.userId, metadata.userId)
    ))

    return { uploadedBy: metadata.userId };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
