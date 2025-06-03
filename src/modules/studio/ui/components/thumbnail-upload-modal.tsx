import { trpc } from "@/trpc/client"
import { UploadDropzone } from "@/lib/uploadthing"
import ResponsiveModal from "@/components/responsive-modal"

interface ThumbnailUploadModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ThumbnailUploadModal({ videoId, open, onOpenChange } : ThumbnailUploadModalProps) {
  const utils = trpc.useUtils();

  function onUploadComplete()
  {
    onOpenChange(false);
    utils.studio.getMany.invalidate();
    utils.studio.getOne.invalidate({ id: videoId });
  }

  return (
    <ResponsiveModal title="Upload a thumbnail"  open={open} onOpenChange={onOpenChange}>
      <UploadDropzone endpoint="thumbnailUploader" input={{ videoId }} onClientUploadComplete={onUploadComplete} />
    </ResponsiveModal>
  )
}

export default ThumbnailUploadModal