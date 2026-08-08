"use client"

import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, ShoppingCartIcon, ReceiptTextIcon, ChefHatIcon, UtensilsCrossedIcon, PackageIcon, FolderTreeIcon, BookOpenIcon, BoxesIcon, TruckIcon, ShoppingBagIcon, QrCodeIcon, UsersIcon, ChartBarIcon, UserCogIcon, Settings2Icon, CreditCardIcon, UserIcon, CoffeeIcon } from "lucide-react"

const data = {
  user: {
    name: "Café Owner",
    email: "owner@cafeos.in",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: (
        <LayoutDashboardIcon
        />
      ),
    },
    {
      title: "POS",
      url: "/pos",
      icon: (
        <ShoppingCartIcon
        />
      ),
    },
    {
      title: "Orders",
      url: "/orders",
      icon: (
        <ReceiptTextIcon
        />
      ),
    },
    {
      title: "Kitchen",
      url: "/kitchen",
      icon: (
        <ChefHatIcon
        />
      ),
    },
    {
      title: "Tables",
      url: "/tables",
      icon: (
        <UtensilsCrossedIcon
        />
      ),
    },
  ],
  catalog: [
    {
      name: "Products",
      url: "/products",
      icon: (
        <PackageIcon
        />
      ),
    },
    {
      name: "Categories",
      url: "/categories",
      icon: (
        <FolderTreeIcon
        />
      ),
    },
    {
      name: "Recipes",
      url: "/recipes",
      icon: (
        <BookOpenIcon
        />
      ),
    },
  ],
  inventory: [
    {
      name: "Inventory",
      url: "/inventory",
      icon: (
        <BoxesIcon
        />
      ),
    },
    {
      name: "Suppliers",
      url: "/suppliers",
      icon: (
        <TruckIcon
        />
      ),
    },
    {
      name: "Purchases",
      url: "/purchases",
      icon: (
        <ShoppingBagIcon
        />
      ),
    },
  ],
  business: [
    {
      name: "QR Ordering",
      url: "/qr-ordering",
      icon: (
        <QrCodeIcon
        />
      ),
    },
    {
      name: "Customers",
      url: "/customers",
      icon: (
        <UsersIcon
        />
      ),
    },
    {
      name: "Reports",
      url: "/reports",
      icon: (
        <ChartBarIcon
        />
      ),
    },
    {
      name: "CRM",
      url: "/crm",
      icon: (
        <UserCogIcon
        />
      ),
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: (
        <Settings2Icon
        />
      ),
    },
    {
      title: "Subscription",
      url: "/subscription",
      icon: (
        <CreditCardIcon
        />
      ),
    },
    {
      title: "Profile",
      url: "/profile",
      icon: (
        <UserIcon
        />
      ),
    },
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
            >
              <CoffeeIcon className="size-5!" />
              <span className="text-base font-semibold">CaféOS</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.catalog} label="Catalog" />
        <NavDocuments items={data.inventory} label="Inventory" />
        <NavDocuments items={data.business} label="Business" />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
