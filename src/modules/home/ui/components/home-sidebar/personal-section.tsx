'use client'

import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { HistoryIcon, ListVideoIcon, ThumbsUpIcon } from "lucide-react"
import { useAuth, useClerk } from "@clerk/nextjs"
import Link from "next/link"

const items = [
    {
        title: "History",
        url: '/playlists/history',
        icon: HistoryIcon,
        auth: true
    },
    {
        title: "Liked Videos",
        url: '/playlists/liked',
        icon: ThumbsUpIcon,
        auth: true
    },
    {
        title: "All playlists",
        url: '/playlists',
        icon: ListVideoIcon,
        auth: true
    },
]

function PersonalSection() {
  const clerk = useClerk();
  const { isSignedIn } = useAuth();

  return (
    <SidebarGroup>
        <SidebarGroupLabel>
            You
        </SidebarGroupLabel>

        <SidebarGroupContent>
            <SidebarMenu>
                {
                    items.map((it) => (
                        <SidebarMenuItem key={it.title}>
                            <SidebarMenuButton tooltip={it.title} asChild isActive={false} onClick={(e) => {
                                if (!isSignedIn && it.auth)
                                {
                                    e.preventDefault();
                                    return clerk.openSignIn();
                                }
                            }}>
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

export default PersonalSection