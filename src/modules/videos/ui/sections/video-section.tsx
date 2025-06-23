'use client'

import { cn } from "@/lib/utils"
import { Suspense } from "react"
import { trpc } from "@/trpc/client"
import { ErrorBoundary } from "react-error-boundary"
import VideoPlayer from "../components/video-player"
import VideoBanner from "../components/video-banner"

interface PageProps {
  videoId: string;
}

function VideoSectionSuspense({ videoId } : PageProps) {
  const [video] = trpc.videos.getOne.useSuspenseQuery({ id: videoId });

  return (
    <>
      <div className={cn(
        "aspect-video bg-black rounded-xl overflow-hidden relative",
        video.muxStatus != "ready" && "rounded-b-none"
      )}>
        <VideoPlayer autoPlay onPlay={() => {}} playbackId={video.muxPlaybackId} thumbnailUrl={video.thumbnailUrl} />
      </div> 
      <VideoBanner status={video.muxStatus} />
    </>
  )
}

function VideoSection({ videoId } : PageProps) {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <VideoSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  )
}

export default VideoSection