'use client'

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { FlameIcon, HomeIcon, PlaySquareIcon } from "lucide-react"
import Link from "next/link"

const items = [
    {
        title: "Home",
        url: '/',
        icon: HomeIcon
    },
    {
        title: "Subscriptions",
        url: '/feed/subscriptions',
        icon: PlaySquareIcon,
        auth: true
    },
    {
        title: "Trending",
        url: '/feed/trending',
        icon: FlameIcon
    },
]

function MainSection() {
  return (
    <SidebarGroup>
        <SidebarGroupContent>
            <SidebarMenu>
                {
                    items.map((it) => (
                        <SidebarMenuItem key={it.title}>
                            <SidebarMenuButton tooltip={it.title} asChild isActive={false} onClick={() => {}}>
                                <Link href={it.url} className="flex items-center gap-4">
                                    <it.icon/>
                                    <span className="text-sm">{it.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))
                }
            </SidebarMenu>
        </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default MainSection