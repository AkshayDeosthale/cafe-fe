import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export const metadata: Metadata = {
  title: "CaféOS — AI-First Cloud Operating System for Cafés & Restaurants",
  description:
    "Run your café or restaurant from one beautiful dashboard. Billing, POS, inventory, kitchen, CRM, reports, and AI analytics — built for modern food businesses in India.",
  keywords: [
    "restaurant operating system",
    "cafe pos",
    "restaurant management software",
    "food tech india",
    "ai analytics for restaurants",
  ],
  openGraph: {
    title: "CaféOS — AI-First Cloud Operating System for Cafés & Restaurants",
    description:
      "Run your café or restaurant from one beautiful dashboard. Billing, POS, inventory, kitchen, CRM, reports, and AI analytics.",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "CaféOS — AI-First Cloud Operating System",
    description:
      "Run your café or restaurant from one beautiful dashboard. Billing, POS, inventory, kitchen, CRM, reports, and AI analytics.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <TooltipProvider>{children}</TooltipProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
