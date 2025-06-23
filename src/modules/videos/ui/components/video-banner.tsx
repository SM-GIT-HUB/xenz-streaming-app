import { AlertTriangleIcon } from "lucide-react";
import { VideoGetOneOutput } from "../../types"

interface PageProps {
  status: VideoGetOneOutput["muxStatus"];
}

function VideoBanner({ status } : PageProps) {
  if (status == "ready") return null;

  return (
    <div className="bg-yellow-400 py-3 px-4 rounded-b-xl flex items-center gap-2">
      <AlertTriangleIcon className="size-4 text-red-900 shrink-0" />
      <p className="text-xs md:text-sm font-medium text-black line-clamp-1">
        This video is still being processed
      </p>
    </div>
  )
}

export default VideoBanner