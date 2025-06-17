import { db } from "@/db"
import { videos } from "@/db/schema"
import { and, eq } from "drizzle-orm"

import { serve } from "@upstash/workflow/nextjs"

interface InputType {
  userId: string,
  videoId: string
}

const DESCRIPTION_SYSTEM_PROMPT = `Your task is to summarize the transcript/title of a video. Please follow these guidelines:
- Be brief. Condense the content into a summary that captures the key points and main ideas without losing important details.
- Avoid jargon or overly complex language unless necessary for the context.
- Focus on the most critical information, ignoring filler, repetitive statements, or irrelevant tangents.
- ONLY return the summary, no other text, annotations, or comments.
- Aim for a summary that is 3-5 sentences long and no more than 200 characters.`;

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
      return text + ". " + "Transcript ended. Now video title: " + video.title;
    })

    const description = await context.run("generate-title", async () => {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY!}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://yourprojectname.com",
          "X-Title": "YouTube clone title generator"
        },
        body: JSON.stringify({
        //   model: "deepseek/deepseek-chat-v3-0324:free",
          model: "google/gemini-2.0-flash-exp:free",
          messages: [
            { role: "system", content: DESCRIPTION_SYSTEM_PROMPT },
            { role: "user", content: transcript }
          ]
        }),
      })

      const body = await res.json();
      const description = body.choices?.[0]?.message?.content ?? "";
      return description;
    })

    await context.run("update-video", async () => {
      await db.update(videos).set({
        description: description || video.description
      })
      .where(and(
        eq(videos.id, video.id),
        eq(videos.userId, video.userId)
      ))
    })
  }
)