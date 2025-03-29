
interface Props {
    params: Promise<{ videoId: String }>
}

async function page({ params }: Props) {
    console.log("Server");

  return (
    <div>{ (await params).videoId }</div>
  )
}

export default page