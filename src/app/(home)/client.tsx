'use client'

import { trpc } from "@/trpc/client"

function Client() {
  const [ data ] = trpc.hello.useSuspenseQuery({ text: "Hello world!" });
    
  return (
    <div>
      Here is the response {data.greeting} <br />
    </div>
  )
}

export default Client