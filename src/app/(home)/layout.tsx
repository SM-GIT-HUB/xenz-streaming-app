import HomeLayout from "@/modules/home/ui/layouts/home-layout";

interface Props {
  children: React.ReactNode;
}

function layout({ children }: Props) {
  return (
    <HomeLayout>
      { children }
    </HomeLayout>
  )
}

export default layout