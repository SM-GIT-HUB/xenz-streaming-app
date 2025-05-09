'use client'

import { trpc } from '@/trpc/client'
import { useRouter } from 'next/navigation'

import { toast } from 'sonner'
import { Loader2Icon, PlusIcon } from 'lucide-react'

import StudioUploader from './studio-uploader'
import { Button } from '@/components/ui/button'
import ResponsiveModal from '@/components/responsive-modal'

function StudioUploadModal() {
  const utills = trpc.useUtils();
  const create = trpc.videos.create.useMutation({
    onSuccess: () => {
      utills.studio.getMany.invalidate();
      toast.success("Video created");
    },
    onError: () => {
      toast.error("Something went wrong, please try again!");
    }
  })

  const router = useRouter();

  function onSuccess()
  {
    if (!create.data?.video.id) {
      return;
    }

    create.reset();
    router.push(`/studio/videos/${create.data.video.id}`);
  }
  
  return (
    <>
      <ResponsiveModal title='Upload a video' open={!!create.data?.url} onOpenChange={() => create.reset()}>
        {
          create.data?.url? <StudioUploader endpoint={create.data?.url} onSuccess={onSuccess} /> :
          <Loader2Icon/>
        }
      </ResponsiveModal>

      <Button variant="secondary" onClick={() => create.mutate()} disabled={create.isPending}>
        {
          create.isPending? <Loader2Icon className='animate-spin'/> : <PlusIcon/>
        }
        Create
      </Button>
    </>
  )
}

export default StudioUploadModal