"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { saveSettings } from "@/lib/actions/people";
import type { Settings } from "@/lib/types";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export function SettingsClient({ settings }: { settings: Settings }) {
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const businessHours: Settings["businessHours"] = {};
    for (const d of DAYS) {
      const open = String(fd.get(`${d}-open`) ?? "");
      const close = String(fd.get(`${d}-close`) ?? "");
      if (open && close) businessHours[d] = { open, close };
    }
    const next: Settings = {
      restaurantName: String(fd.get("restaurantName") ?? ""),
      gstin: String(fd.get("gstin") ?? ""),
      address: String(fd.get("address") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      logoUrl: String(fd.get("logoUrl") ?? ""),
      invoicePrefix: String(fd.get("invoicePrefix") ?? "INV-"),
      defaultGstRate: Number(fd.get("defaultGstRate") ?? 5),
      businessHours,
      printerAutoKot: fd.get("printerAutoKot") === "on",
      printerPaperWidth: (fd.get("printerPaperWidth") === "58mm" ? "58mm" : "80mm"),
    };
    startTransition(async () => {
      const r = await saveSettings(next);
      if (r.ok) toast.success("Settings saved");
      else toast.error(r.error);
    });
  }

  return (
    <form onSubmit={submit} className="px-4 lg:px-6">
      <Tabs defaultValue="restaurant">
        <TabsList>
          <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="hours">Business Hours</TabsTrigger>
          <TabsTrigger value="printer">Printer</TabsTrigger>
        </TabsList>

        <TabsContent value="restaurant">
          <Card>
            <CardHeader><CardTitle className="text-base">Restaurant Info</CardTitle></CardHeader>
            <CardContent className="grid max-w-xl gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="restaurantName">Name</Label>
                <Input id="restaurantName" name="restaurantName" defaultValue={settings.restaurantName} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input id="gstin" name="gstin" defaultValue={settings.gstin} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" defaultValue={settings.phone} />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" defaultValue={settings.address} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input id="logoUrl" name="logoUrl" defaultValue={settings.logoUrl} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader><CardTitle className="text-base">Billing</CardTitle></CardHeader>
            <CardContent className="grid max-w-xl gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="invoicePrefix">Invoice prefix</Label>
                <Input id="invoicePrefix" name="invoicePrefix" defaultValue={settings.invoicePrefix} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="defaultGstRate">Default GST %</Label>
                <Input id="defaultGstRate" name="defaultGstRate" type="number" min="0" max="28" step="0.1" defaultValue={settings.defaultGstRate} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours">
          <Card>
            <CardHeader><CardTitle className="text-base">Business Hours</CardTitle></CardHeader>
            <CardContent className="grid max-w-xl gap-2">
              {DAYS.map((d) => (
                <div key={d} className="grid grid-cols-[60px_1fr_1fr] items-center gap-2">
                  <span className="text-sm font-medium uppercase">{d}</span>
                  <Input type="time" name={`${d}-open`} defaultValue={settings.businessHours[d]?.open ?? "08:00"} aria-label={`${d} open`} />
                  <Input type="time" name={`${d}-close`} defaultValue={settings.businessHours[d]?.close ?? "22:00"} aria-label={`${d} close`} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="printer">
          <Card>
            <CardHeader><CardTitle className="text-base">Printer (UI only)</CardTitle></CardHeader>
            <CardContent className="grid max-w-xl gap-4">
              <div className="flex items-center gap-2">
                <Switch id="printerAutoKot" name="printerAutoKot" defaultChecked={settings.printerAutoKot} />
                <Label htmlFor="printerAutoKot">Auto-print KOT on order</Label>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="printerPaperWidth">Paper width</Label>
                <Select name="printerPaperWidth" defaultValue={settings.printerPaperWidth}>
                  <SelectTrigger id="printerPaperWidth" className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="58mm">58mm</SelectItem>
                    <SelectItem value="80mm">80mm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-4">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save Settings"}</Button>
      </div>
    </form>
  );
}
