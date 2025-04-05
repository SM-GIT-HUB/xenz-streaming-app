import HomeView from "@/modules/home/ui/views/home-view"
import { trpc } from "@/trpc/server"


import { HydrateClient } from "@/trpc/server"
import { Suspense } from "react"

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    categoryId?: string
  }>
}

async function Page({ searchParams } : PageProps) {
  const { categoryId } = await searchParams;

  void trpc.categories.getMany.prefetch();

  return (
    <div className="">
      <HydrateClient>
        <HomeView categoryId={categoryId} />
      </HydrateClient>
    </div>
  )
}

export default Page