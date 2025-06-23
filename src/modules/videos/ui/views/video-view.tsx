import VideoSection from "../sections/video-section"

interface PageProps {
  videoId: string;
}

function VideoView({ videoId } : PageProps) {
  return (
    <div className="flex flex-col max-w-[1700px] mx-auto pt-2.5 px-4 mb-10">
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <VideoSection videoId={videoId} />
        </div>
      </div>
    </div>
  )
}

export default VideoView