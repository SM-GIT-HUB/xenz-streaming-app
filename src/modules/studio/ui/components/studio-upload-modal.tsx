'use client'

import { trpc } from '@/trpc/client'

import { Loader2Icon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

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
  
  return (
    <Button variant="secondary" onClick={() => create.mutate()} disabled={create.isPending}>
      {
        create.isPending? <Loader2Icon className='animate-spin'/> : <PlusIcon/>
      }
      Create
    </Button>
  )
}

export default StudioUploadModal