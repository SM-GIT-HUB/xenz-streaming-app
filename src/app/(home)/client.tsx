'use client'

import { trpc } from "@/trpc/client"

interface DataProps {
  d: {
    greeting: string
  }
}

function Client({ d }: DataProps) {
  const [ data ] = trpc.hello.useSuspenseQuery({ text: "Hello world!" });
    
  return (
    <div>
      Here is the response {data.greeting} <br />
      Here is another response {d.greeting}
    </div>
  )
}

export default Client