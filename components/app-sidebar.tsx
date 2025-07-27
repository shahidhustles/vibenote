"use client";

import {
  ChevronUp,
  DraftingCompass,
  Home,
  Library,
  LogOut,
  PlusCircle,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "./ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { Skeleton } from "./ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { createNewChat } from "@/features/basic-functionality/actions/create-new-chat";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function AppSidebar() {
  const { user, isLoaded } = useUser();
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const handleNewChatClick = () => {
    startTransition(async () => {
      const url = await createNewChat({
        userId: user!.id,
        title: "New Learning",
      });
      router.push(url);
    });
  };

  // Menu items.
  const items = [
    {
      title: "Home",
      icon: Home,
      url: "/chat",
    },
    {
      title: "New Chat",
      icon: PlusCircle,
      url: "#",
      onclick: handleNewChatClick,
    },
    {
      title: "Library",
      icon: Library,
      url: "#",
    },
    {
      title: "Fibonacci Videos",
      icon: DraftingCompass,
      url: "#",
    },
  ];
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xl font-semibold px-2 py-3">
            Vibe Note
          </SidebarGroupLabel>
          <Separator className="my-2 " />
          <SidebarGroupContent className="px-2">
            <SidebarMenu className="space-y-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`h-8 text-base ${isPending && item.title === "New Chat" ? "opacity-50" : ""}`}
                  >
                    <Link
                      href={item.url}
                      onClick={item.onclick}
                      className="flex items-center gap-3"
                    >
                      <div className="p-1.5 rounded-md bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 dark:from-blue-900/20 dark:to-purple-900/20">
                        {isPending && item.title === "New Chat" ? (
                          <div className="h-4 w-4 border-2 border-white dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <item.icon className="h-4 w-4 text-white dark:text-blue-400" />
                        )}
                      </div>
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <Separator className="my-2 w-2" />
        <SidebarGroup>
          {/* Prev Chats will come here  */}
          {/* this are dummy :  */}
          <SidebarGroupLabel className="text-sm font-medium px-2 py-2 text-muted-foreground">
            Previous Chats
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-8 text-sm">
                  <Link href="#" className="flex items-center gap-3">
                    <span className="font-medium truncate">
                      React Hooks Explained
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-8 text-sm">
                  <Link href="#" className="flex items-center gap-3">
                    <span className="font-medium truncate">
                      JavaScript ES6 Features
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-8 text-sm">
                  <Link href="#" className="flex items-center gap-3">
                    <span className="font-medium truncate">
                      CSS Grid vs Flexbox
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-8 text-sm">
                  <Link href="#" className="flex items-center gap-3">
                    <span className="font-medium truncate">
                      TypeScript Best Practices
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-8 text-sm">
                  <Link href="#" className="flex items-center gap-3">
                    <span className="font-medium truncate">
                      API Design Patterns
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-12 text-base">
                  {isLoaded ? (
                    <>
                      <Image
                        src={user!.imageUrl}
                        alt="ProfilePic"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <span className="font-medium truncate">
                        {user?.firstName} {user?.lastName}
                      </span>
                      <ChevronUp className="ml-auto h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                      <ChevronUp className="ml-auto h-4 w-4" />
                    </>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem className="h-10 text-base">
                  <LogOut className="mr-2 h-4 w-4" />
                  <SignOutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
