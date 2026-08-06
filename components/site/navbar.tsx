"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, ArrowRight, ChevronRight } from "lucide-react";
import {
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/site/theme-toggle";

const navLinks = [
  {
    href: "#features",
    label: "Features",
    description: "POS, CRM, analytics & more",
  },
  {
    href: "#modules",
    label: "Modules",
    description: "10 tools in one platform",
  },
  {
    href: "#pricing",
    label: "Pricing",
    description: "Free to start, scale as you grow",
  },
  {
    href: "#faq",
    label: "FAQ",
    description: "Common questions answered",
  },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="CaféOS" className="h-8 w-8" />
          <span className="text-lg font-semibold tracking-tight">CaféOS</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Show when="signed-out">
            <div className="relative inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <SignInButton mode="modal">
                <span className="absolute inset-0" />
              </SignInButton>
              Log in
            </div>
            <div className="relative inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80">
              <SignUpButton mode="modal">
                <span className="absolute inset-0" />
              </SignUpButton>
              Start free trial
            </div>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-80 p-0">
              <div className="flex h-full flex-col">
                {/* Brand header */}
                <div className="border-b border-border/60 px-6 pb-5 pt-6">
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5"
                  >
                    <img src="/logo.svg" alt="CaféOS" className="h-8 w-8" />
                    <span className="text-lg font-semibold tracking-tight">
                      CaféOS
                    </span>
                  </Link>
                  <p className="mt-2 text-xs text-muted-foreground">
                    The cloud OS for cafés & restaurants
                  </p>
                </div>

                {/* Nav links */}
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-muted"
                    >
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {link.label}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {link.description}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </Link>
                  ))}
                </nav>

                {/* Footer CTA */}
                <div className="border-t border-border/60 p-4">
                  <Show when="signed-out">
                    <div className="relative flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                      <SignUpButton mode="modal">
                        <span className="absolute inset-0" />
                      </SignUpButton>
                      Start free trial
                      <ArrowRight className="h-4 w-4" />
                    </div>
                    <div className="relative mt-2 flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                      <SignInButton mode="modal">
                        <span className="absolute inset-0" />
                      </SignInButton>
                      Log in
                    </div>
                  </Show>
                  <Show when="signed-in">
                    <UserButton />
                  </Show>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
