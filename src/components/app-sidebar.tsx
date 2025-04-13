"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

import { LayoutDashboard, ReceiptText, CalendarDays, Bot } from "lucide-react";

// Sidebar navigation items (same as navbar minus Sign In)
const navItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Transactions",
        href: "/transactions",
        icon: ReceiptText,
    },
    {
        title: "Reports",
        href: "/reports",
        icon: CalendarDays,
    },
    {
        title: "Assistant",
        href: "/assistant",
        icon: Bot,
    },
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar>
            <SidebarHeader className="px-6 py-4 font-bold text-orange-500 text-xl">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo_transparent.png" alt="Finverse Logo" width={40} height={40} />
                    <span className="text-2xl font-bold text-orange-500 hover:text-orange-600">Finverse</span>
                </Link>
            </SidebarHeader>

            <SidebarContent className="border-t">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.href}>
                                            <item.icon className="w-5 h-5" />
                                            <span
                                                className={
                                                    pathname === item.href ? "font-semibold text-orange-600" : ""
                                                }
                                            >
                                                {item.title}
                                            </span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4">
                <UserButton />
            </SidebarFooter>
        </Sidebar>
    );
}
