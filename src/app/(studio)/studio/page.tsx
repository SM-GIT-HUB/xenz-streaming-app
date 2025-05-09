import { HydrateClient, trpc } from "@/trpc/server"

import { DEFAULT_LIMIT } from "@/constants"
import StudioView from "@/modules/studio/ui/views/studio-view"

async function Page() {
  void trpc.studio.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT
  })

  return (
    <HydrateClient>
      <StudioView/>
    </HydrateClient>
  )
}

export default Page