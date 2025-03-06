import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-[20px] text-blue-800">Hello World</h1>
      <Button variant={"outline"}>
        Click me
      </Button>
    </div>
  )
}
