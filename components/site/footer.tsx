import Link from "next/link";
import { Globe, Mail, MessageCircle } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Modules", href: "#modules" },
    { label: "Pricing", href: "#pricing" },
    { label: "Changelog", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "Community", href: "#" },
    { label: "Status", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Security", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="CaféOS" className="h-8 w-8" />
              <span className="text-lg font-semibold tracking-tight">CaféOS</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              AI-first cloud operating system for cafés, bakeries, QSRs, and
              restaurants. Built in India, for India.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Globe className="h-4 w-4" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Mail className="h-4 w-4" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <MessageCircle className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-sm font-semibold">{group}</h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CaféOS. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Crafted for the future of food service.
          </p>
        </div>
      </div>
    </footer>
  );
}
