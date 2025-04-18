import { db } from "@/db"
import { videos } from "@/db/schema"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { eq, and, or, lt, desc, gt } from "drizzle-orm"
import { z } from "zod"

export const studioRouter = createTRPCRouter({
    getMany: protectedProcedure.input(
        z.object({
            cursor: z.object({
                id: z.string().uuid(),
                updatedAt: z.date()
            }).nullish(),
            limit: z.number().min(1).max(100)
        })
    )
    .query(async({ ctx, input }) => {
        const { cursor, limit } = input;
        const { id: userId } = ctx.user;

        const data = await db.select().from(videos).where(and(
            eq(videos.userId, userId), 
            cursor?
            or(
                gt(videos.updatedAt, cursor.updatedAt),
                and(
                    eq(videos.updatedAt, cursor.updatedAt),
                    gt(videos.id, cursor.id)
                )
            ) :
            undefined
        ))
        .orderBy(desc(videos.updatedAt), desc(videos.id))
        .limit(limit + 1)

        const hasMore = data.length > limit;

        if (hasMore) {
            data.pop();
        }

        const lastItem = data[data.length - 1];
        const nextCursor = hasMore? { id: lastItem.id, updatedAt: lastItem.updatedAt } : null;

        return { items: { ...data }, nextCursor };
    })
})