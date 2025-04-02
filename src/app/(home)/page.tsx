import { trpc } from "@/trpc/server"
import Client from "./client"

import { HydrateClient } from "@/trpc/server"
import { Suspense } from "react"

export default async function Home() {
  void trpc.hello.prefetch({ text: "Hello world!" });

  return (
    <div className="">
      <HydrateClient>
        <Suspense fallback={<p>Loading...</p>}>
          <Client />
        </Suspense>
      </HydrateClient>
    </div>
  )
}
