"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const TITLES: [RegExp, string][] = [
  [/^\/dashboard/, "Dashboard"],
  [/^\/pos/, "POS"],
  [/^\/orders/, "Orders"],
  [/^\/kitchen/, "Kitchen"],
  [/^\/tables/, "Tables"],
  [/^\/products/, "Products"],
  [/^\/categories/, "Categories"],
  [/^\/recipes/, "Recipes"],
  [/^\/inventory/, "Inventory"],
  [/^\/suppliers/, "Suppliers"],
  [/^\/purchases/, "Purchases"],
  [/^\/qr-ordering/, "QR Ordering"],
  [/^\/customers/, "Customers"],
  [/^\/reports/, "Reports"],
  [/^\/crm/, "CRM"],
  [/^\/settings/, "Settings"],
  [/^\/subscription/, "Subscription"],
  [/^\/profile/, "Profile"],
];

export function SiteHeader() {
  const pathname = usePathname();
  const title = TITLES.find(([re]) => re.test(pathname))?.[1] ?? "CaféOS";
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium">{title}</h1>
      </div>
    </header>
  );
}
