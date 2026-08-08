"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

/** Debounced search that writes ?search= into the URL (server-side filtering). */
export function SearchForm({ placeholder = "Search…" }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("search") ?? "");
  const [, startTransition] = useTransition();

  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set("search", value);
      else next.delete("search");
      next.delete("page");
      startTransition(() => router.replace(`${pathname}?${next.toString()}`));
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative w-full max-w-xs">
      <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="pl-8"
        aria-label="Search"
      />
    </div>
  );
}
