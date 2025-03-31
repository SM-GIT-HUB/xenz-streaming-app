interface LayoutProps {
    children: React.ReactNode;
}

function Layout({ children } : LayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      { children }
    </div>
  )
}

export default Layout