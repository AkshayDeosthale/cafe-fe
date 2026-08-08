import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <ClerkProvider>{children}</ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
