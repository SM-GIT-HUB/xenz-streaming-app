import { trpc } from "@/trpc/server"
import Client from "./client"

import { HydrateClient } from "@/trpc/server"
import { Suspense } from "react"

export default async function Home() {
  const data = await trpc.hello({ text: "hi" });
  void trpc.hello.prefetch({ text: "Hello wo2rld!" });

  return (
    <div className="">
      <HydrateClient>
        <Suspense fallback={<p>Loading...</p>}>
          <Client d={data} />
        </Suspense>
      </HydrateClient>
    </div>
  )
}
