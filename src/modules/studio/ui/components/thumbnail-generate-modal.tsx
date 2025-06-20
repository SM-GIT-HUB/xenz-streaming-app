import { z } from "zod"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { trpc } from "@/trpc/client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import ResponsiveModal from "@/components/responsive-modal"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

interface ThumbnailGenerateModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  prompt: z.string().min(20)
})

function ThumbnailGenerateModal({ videoId, open, onOpenChange } : ThumbnailGenerateModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: ""
    }
  })

  const utils = trpc.useUtils();

  const generateThumbnail = trpc.videos.generateThumbnail.useMutation({
    onSuccess: () => {
      toast.dismiss();
      toast.success("Background job started", { description: "This may take some time" });
    },
    onError: () => {
      toast.dismiss();
      toast.error("Something went wrong");
    }
  })

  function onSubmit(values: z.infer<typeof formSchema>)
  {
    toast.loading("Please wait");
    generateThumbnail.mutate({
      id: videoId,
      prompt: values.prompt
    })
    onOpenChange(false);
    // form.reset();
    utils.studio.getMany.invalidate();
    utils.studio.getOne.invalidate({ id: videoId });
  }

  return (
    <ResponsiveModal title="Generate a thumbnail" open={open} onOpenChange={onOpenChange}>
      <Form { ...form }>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel> Prompt </FormLabel>
                <FormControl>
                  <Textarea { ...field } className="resize-none" cols={30} rows={5} placeholder="Description of Thumbnail" />
                </FormControl>

                <FormMessage/>
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" >
              Generate
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  )
}

export default ThumbnailGenerateModal