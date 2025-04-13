'use client'

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import StudioSidebarHeader from "./studio-sidebar-header"

import { LogOutIcon, VideoIcon } from "lucide-react"

import { usePathname } from "next/navigation"
import Link from "next/link"

function StudioSidebar() {
  const pathName = usePathname();

  return (
    <Sidebar className="pt-16 x-40" collapsible="icon">
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <StudioSidebarHeader />

              <SidebarMenuItem>
                <SidebarMenuButton isActive={pathName == '/studio'} tooltip={"Content"} asChild>
                  <Link href={'/studio'}>
                    <VideoIcon className="size-5"/>
                    <span className="text-sm">Content</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <Separator/>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip={"Exit Studio"} asChild>
                  <Link href={'/'}>
                    <LogOutIcon className="size-5"/>
                    <span className="text-sm">Exit Studio</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export default StudioSidebar