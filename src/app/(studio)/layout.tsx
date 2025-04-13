import StudioLayout from "@/modules/studio/ui/layouts/studio-layout";

interface Props {
  children: React.ReactNode;
}

function layout({ children }: Props) {
  return (
    <StudioLayout>
      { children }
    </StudioLayout>
  )
}

export default layout