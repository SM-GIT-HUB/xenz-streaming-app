import { HydrateClient, trpc } from "@/trpc/server"
import StudioView from "@/modules/studio/ui/view/studio-view"
import { DEFAULT_LIMIT } from "@/constants"
import { ErrorBoundary } from "react-error-boundary"

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