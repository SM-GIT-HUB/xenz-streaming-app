'use client'

import { Suspense } from "react"
import { DEFAULT_LIMIT } from "@/constants"
import { ErrorBoundary } from "react-error-boundary"
import InfiniteScroll from "@/components/infinite-scroll"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { trpc } from "@/trpc/client"
import Link from "next/link"

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
                      {video.title}
                    </TableCell>
                    <TableCell>
                      Visibility
                    </TableCell>
                    <TableCell>
                      Status
                    </TableCell>
                    <TableCell>
                      Date
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