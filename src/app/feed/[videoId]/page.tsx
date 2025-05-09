
interface Props {
  params: Promise<{ videoId: String }>
}

async function page({ params }: Props) {
  return (
    <div>{ (await params).videoId }</div>
  )
}

export default page