'use client'

import Link from "next/link"
import { useForm } from "react-hook-form"
import { Suspense, useState } from "react"
import { useRouter } from "next/navigation"
import { ErrorBoundary } from "react-error-boundary"
import { CopyCheckIcon, CopyIcon, Globe2Icon, ImagePlusIcon, Loader2Icon, LockIcon, MoreVerticalIcon, RotateCcwIcon, SparklesIcon, TrashIcon } from "lucide-react"

import { trpc } from "@/trpc/client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormLabel, FormMessage, FormItem } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { z } from "zod"
import { toast } from "sonner"
import { snakeCaseToTitle } from "@/lib/utils"
import { videoUpdateSchema } from "@/db/schema"
import { zodResolver } from "@hookform/resolvers/zod"

import VideoPlayer from "@/modules/videos/ui/components/video-player"
import Image from "next/image"
import ThumbnailUploadModal from "../components/thumbnail-upload-modal"

interface PageProps {
  videoId: string;
}

function FormSectionSkeleton()
{
  return (
    <p>Loading...</p>
  )
}

function FormSectionSuspense({ videoId } : PageProps)
{
  const router = useRouter();

  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
  const [categories] = trpc.categories.getMany.useSuspenseQuery();

  const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false);

  const form = useForm<z.infer<typeof videoUpdateSchema>>({
    resolver: zodResolver(videoUpdateSchema),
    defaultValues: video
  })

  const utils = trpc.useUtils();

  const update = trpc.videos.update.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({ id: videoId });
      toast.success("Video details updated");
    },
    onError: () => {
      toast.error("Something went wrong");
    }
  })

  const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({ id: videoId });
      toast.dismiss();
      toast.success("Video thumbnail restored");
    },
    onError: () => {
      toast.dismiss();
      toast.error("Something went wrong");
    }
  })

  const generateThumbnail = trpc.videos.generateThumbnail.useMutation({
    onSuccess: () => {
      toast.success("Background job started", { description: "This may take some time" });
    },
    onError: () => {
      toast.error("Something went wrong");
    }
  })

  const generateTitle = trpc.videos.generateTitle.useMutation({
    onSuccess: () => {
      toast.success("Background job started", { description: "This may take some time" });
    },
    onError: () => {
      toast.error("Something went wrong");
    }
  })

  const generateDescription = trpc.videos.generateDescription.useMutation({
    onSuccess: () => {
      toast.success("Background job started", { description: "This may take some time" });
    },
    onError: () => {
      toast.error("Something went wrong");
    }
  })

  const remove = trpc.videos.remove.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      toast.success("Video deleted successfully");
      router.push('/studio');
    },
    onError: () => {
      toast.error("Something went wrong");
    }
  })

  const onSubmit = (data: z.infer<typeof videoUpdateSchema>) => {
    if (video.title == data.title && video.description == data.description && video.categoryId == data.categoryId && video.visibility == data.visibility)
    {
      toast.warning("Please update video details to save");
      return;
    }

    update.mutate(data);
  }

  const fullUrl = `${process.env.VERCEL_URL || "http://localhost:3000"}/videos/${videoId}`;
  const [isCopied, setIsCopied] = useState(false);

  async function onCopy()
  {
    await navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000)
  }

  function titleGenerate()
  {
    if (!video.muxTrackId && !video.description)
    {
      toast.error("Your video must have Subtitles or Description.");
      return;
    }

    generateTitle.mutate({ id: videoId });
  }

  function descriptionGenerate()
  {
    if (!video.muxTrackId && !video.title)
    {
      toast.error("Your video must have Title or Subtitles.");
      return;
    }

    generateDescription.mutate({ id: videoId });
  }

  return (
    <>
      <ThumbnailUploadModal open={thumbnailModalOpen} onOpenChange={setThumbnailModalOpen} videoId={videoId} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Video details</h1>
              <h1 className="text-xs text-muted-foreground">Manage your video details</h1>
            </div>

            <div className="flex items-center gap-x-2">
              <Button type="submit" disabled={update.isPending || remove.isPending} className="w-[100px] transition-all">
                {
                  (update.isPending || remove.isPending)? "Waiting..." : "Save"
                }
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVerticalIcon/>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="cursor-pointer" disabled={remove.isPending} onClick={() => remove.mutate({ id: videoId })}>
                    <TrashIcon className="size-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="space-y-8 lg:col-span-3">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-lg">
                    <div className="flex items-center gap-x-2">
                      Title

                      {
                        generateTitle.isPending? <Loader2Icon className="animate-spin text-[#00000097]"/> :
                        <Button size="icon" variant="outline" type="button" className="rounded-full size-6 [&_svg]:size-3" onClick={titleGenerate}
                        disabled={generateTitle.isPending || !video.muxAssetId}>
                          <SparklesIcon/>
                        </Button>
                      }

                    </div>
                  </FormLabel>

                  <FormControl>
                    <Input {...field} placeholder="Add a title to your video" />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}/>

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">
                    <div className="flex items-center gap-x-2">
                      Description

                      {
                        generateDescription.isPending? <Loader2Icon className="animate-spin text-[#00000097]"/> :
                        <Button size="icon" variant="outline" type="button" className="rounded-full size-6 [&_svg]:size-3" onClick={descriptionGenerate}
                        disabled={generateDescription.isPending || !video.muxAssetId}>
                          <SparklesIcon/>
                        </Button>
                      }

                    </div>
                  </FormLabel>

                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} rows={10} placeholder="Add a description to your video" className="resize-none pr-10" />
                  </FormControl>

                  <FormMessage  />
                </FormItem>
              )}/>

              <FormField name="thumbnailUrl" control={form.control} render={() => (
                <FormItem>
                  <FormLabel className="font-semibold">Thumbnail</FormLabel>

                  <FormControl>
                    <div className="p-0.5 border border-dashed border-neutral-400 hover:border-black duration-300 relative h-[84px] w-[153px] group">
                      <Image fill alt="Thumbnail" src={video.thumbnailUrl ?? "/placeholder.svg"} className="object-cover" />

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" size="icon" className="bg-black/50 absolute top-1 right-1 outline-none
                          rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 duration-300 size-8">
                            <MoreVerticalIcon className="text-white" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="start" side="right">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => setThumbnailModalOpen(true)} >
                            <ImagePlusIcon className="size-4 mr-1" />
                            Change
                          </DropdownMenuItem>

                          <DropdownMenuItem className="cursor-pointer" onClick={() => generateThumbnail.mutate({ id: videoId })}>
                            <SparklesIcon className="size-4 mr-1" />
                            AI-generated
                          </DropdownMenuItem>

                          <DropdownMenuItem className="cursor-pointer" onClick={() => {
                            toast.loading("Please wait...");
                            restoreThumbnail.mutate({ id: videoId });
                          }}>
                            <RotateCcwIcon className="size-4 mr-1" />
                            Restore
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="categoryId" render={({ field }) => (
                <FormItem className="pb-10">
                  <FormLabel className="font-semibold">
                    Category
                  </FormLabel>

                  <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id} >
                            {category.name}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}/>
            </div>

            <div className="flex flex-col gap-y-8 lg:col-span-2">
              <div className="flex flex-col gap-4 bg-[#f9f9f9] rounded-xl overflow-hidden h-fit">
                <div className="aspect-video overflow-hidden relative">
                  <VideoPlayer playbackId={video.muxPlaybackId} thumbnailUrl={video.thumbnailUrl} />
                </div>

                <div className="p-4 flex flex-col gap-y-6">
                  <div className="flex justify-between items-center gap-x-2">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Video link
                      </p>

                      <div className="flex items-center gap-x-2">
                        <Link href={`/videos/${video.id}`}>
                          <p className="line-clamp-1 text-sm text-blue-500">
                            {fullUrl}
                          </p>
                        </Link>

                          <Button type="button" variant="ghost" size="icon" className="shrink-0" disabled={isCopied} onClick={onCopy} >
                            {
                              isCopied? <CopyCheckIcon /> :
                              <CopyIcon />
                            }
                          </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Video status
                      </p>
                      <p className="text-sm">
                        {snakeCaseToTitle(video.muxStatus || "Preparing")}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Subtitle status
                      </p>
                      <p className="text-sm">
                        {snakeCaseToTitle(video.muxTrackStatus || "No captions")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <FormField control={form.control} name="visibility" render={({ field }) => (
                <FormItem className="pb-10">
                  <FormLabel className="font-semibold">
                    Visibility
                  </FormLabel>

                  <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectItem value="public" >
                        <div className="flex items-center">
                          <Globe2Icon className="size-4 mr-2" />
                          Public
                        </div>
                      </SelectItem>

                      <SelectItem value="private" >
                        <div className="flex items-center">
                          <LockIcon  className="size-4 mr-2" />
                          Private
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage  />
                </FormItem>
              )}/>
            </div>
          </div>
        </form>
      </Form>
    </>
  )
}

function FormSection({ videoId } : PageProps) {
  return (
    <Suspense fallback={<FormSectionSkeleton/>}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <FormSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  )
}

export default FormSection