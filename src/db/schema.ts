import { relations } from "drizzle-orm"
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod"
import { integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core"
import { string } from "zod"

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").unique().notNull(),
    name: text("name").notNull(),
    imageUrl: text("image_url").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (t) => [uniqueIndex("clerk_id_idx").on(t.clerkId)])

export const userRelations = relations(users, ({ many }) => ({
    video: many(videos)
}))


export const categories = pgTable("categories", {
    id: uuid("id").primaryKey().defaultRandom(),
    description: text("description"),
    name: text("name").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (t) => [uniqueIndex("name_idx").on(t.name)])

export const categoryRelations = relations(users, ({ many }) => ({
    video: many(videos)
}))

export const videoVisibility = pgEnum("video-visibility", [
    "private",
    "public"
])

export const videos = pgTable("videos", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),

    muxStatus: text("mux_status"),
    muxTrackId: text("mux_track_id"),
    muxTrackStatus: text("mux_track_status"),
    muxAssetId: text("mux_asset_id").unique(),
    muxUploadId: text("mux_upload_id").unique(),
    muxPlaybackId: text("mux_playback_id").unique(),
    
    previewUrl: text("preview_url"),
    previewKey: text("preview_key"),
    thumbnailUrl: text("thumbnail_url"),
    thumbnailKey: text("thumbnail_key"),
    defaultThumbnailUrl: text("default_thumbnail_url"),
    defaultThumbnailKey: text("default_thumbnail_key"),
    
    duration: integer("duration").default(0).notNull(),
    visibility: videoVisibility("visibility").default("private").notNull(),

    userId: uuid("user_id").references(() => users.id, {
        onDelete: "cascade"
    }).notNull(),
    categoryId: uuid("category_id").references(() => categories.id, {
        onDelete: "set null"
    }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export const videoInsertSchema = createInsertSchema(videos);
export const videoSelectSchema = createSelectSchema(videos);
export const videoUpdateSchema = createUpdateSchema(videos);

export const videoRelations = relations(videos, ({ one }) => ({
    user: one(users, {
        fields: [videos.userId],
        references: [users.id]
    }),
    category: one(categories, {
        fields: [videos.categoryId],
        references: [categories.id]
    })
}))


