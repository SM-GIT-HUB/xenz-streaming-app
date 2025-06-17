import { db } from "@/db"
import { videos } from "@/db/schema"
import { and, eq } from "drizzle-orm"

import { serve } from "@upstash/workflow/nextjs"

interface InputType {
  userId: string,
  videoId: string
}

const TITLE_SYSTEM_PROMPT = `Your task is to generate an SEO-focused title for a YouTube video based on its transcript. Please follow these guidelines:
- Be concise but descriptive, using relevant keywords to improve discoverability.
- Highlight the most compelling or unique aspect of the video content.
- Avoid jargon or overly complex language unless it directly supports searchability.
- Use action-oriented phrasing or clear value propositions where applicable.
- Ensure the title is 3-8 words long and no more than 100 characters.
- ONLY return the title as plain text. Do not add quotes or any additional formatting.`;

export const { POST } = serve(
  async (context) => {
    const input = context.requestPayload as InputType;
    const { userId, videoId } = input;

    const video = await context.run("get-video", async () => {
      const [video] = await db.select().from(videos).where(and(
        eq(videos.id, videoId),
        eq(videos.userId, userId)
      ))
        
      if (!video) {
        throw new Error("Video not found");
      }

      return video;
    })

    const transcript = await context.run("get-transcript", async () => {
      const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;
      const response = await fetch(trackUrl);

      if (!response.ok) {
        return video.description;
      }

      const text = await response.text();
      return text + ". " + "Transcript ended. Now video description: " + video.description;
    })

    const title = await context.run("generate-title", async () => {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY!}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://yourprojectname.com",
          "X-Title": "YouTube clone title generator"
        },
        body: JSON.stringify({
          // model: "deepseek/deepseek-chat-v3-0324:free",
          model: "google/gemini-2.0-flash-exp:free",
          messages: [
            { role: "system", content: TITLE_SYSTEM_PROMPT },
            { role: "user", content: transcript }
          ]
        }),
      })

      const body = await res.json();
      const title = body.choices?.[0]?.message?.content ?? "";
      return title;
    })

    await context.run("update-video", async () => {
      await db.update(videos).set({
        title: title || video.title
      })
      .where(and(
        eq(videos.id, video.id),
        eq(videos.userId, video.userId)
      ))
    })
  }
)