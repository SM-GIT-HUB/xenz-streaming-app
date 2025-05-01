'use client'

import { trpc } from "@/trpc/client"

import { Suspense } from "react"
import { DEFAULT_LIMIT } from "@/constants"
import { ErrorBoundary } from "react-error-boundary"
import InfiniteScroll from "@/components/infinite-scroll"

import Link from "next/link"

import { format } from "date-fns"
import { snakeCaseToTitle } from "@/lib/utils"
import { Globe2Icon, LockIcon } from "lucide-react"

import VideoThumbnail from "@/modules/videos/ui/components/video-thumbnail"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

function VideosSectionSuspense()
{
  const [videos, query] = trpc.studio.getMany.useSuspenseInfiniteQuery({
    limit: DEFAULT_LIMIT
  }, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  return (
    <div>
      <div className="border-y">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 w-[510px]">Video</TableHead>
              <TableHead className="">Visibility</TableHead>
              <TableHead className="">Status</TableHead>
              <TableHead className="">Date</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Comments</TableHead>
              <TableHead className="text-right pr-6">Likes</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {
              videos.pages.flatMap((page) => page.items).map((video, idx) => (
                <Link href={`/studio/videos/${video.id}`} key={idx} legacyBehavior>
                  <TableRow className="cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="relative aspect-video w-36 shrink-0">
                          <VideoThumbnail imageUrl={video.thumbnailUrl} previewUrl={video.previewUrl} title={video.title} duration={video.duration || 0} />
                        </div>

                        <div className="flex flex-col overfloh gap-y-1">
                          <span className="text-sm line-clamp-1">{video.title}</span>
                          <span className="text-sm line-clamp-1 text-muted-foreground">
                            {video.description || "No description"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center">
                        {
                          video.visibility == "private"?
                          <LockIcon className="size-4 mr-2" /> :
                          <Globe2Icon className="size-4 mr-2" />
                        }
                        {snakeCaseToTitle(video.visibility)}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center">
                        {snakeCaseToTitle(video.muxStatus || "Error")}
                      </div>
                    </TableCell>

                    <TableCell className="text-sm truncate">
                      {format(new Date(video.createdAt), "d MMM yyyy")}
                    </TableCell>

                    <TableCell>
                      Views
                    </TableCell>

                    <TableCell>
                      Comments
                    </TableCell>

                    <TableCell>
                      Likes
                    </TableCell>
                  </TableRow>
                </Link>
              ))
            }
          </TableBody>
        </Table>
      </div>
      
      <InfiniteScroll isManual hasNextPage={query.hasNextPage} isFetchingNextPage={query.isFetchingNextPage} fetchNextPage={query.fetchNextPage} />
    </div>
  )
}

function VideosSection() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <VideosSectionSuspense/>
      </ErrorBoundary>
    </Suspense>
  )
}

export default VideosSection