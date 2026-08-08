"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ConfirmButton } from "@/components/shared/confirm-button";
import { EmptyState } from "@/components/shared/misc";
import { removeProduct, saveProduct, toggleProduct } from "@/lib/actions/catalog";
import type { Category, Product, ProductInput, Variant } from "@/lib/types";
import { inr } from "@/lib/utils/format";
import { PencilIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";

export function ProductsClient({
  products,
  categories,
}: {
  products: Product[];
  categories: (Category & { productCount: number })[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  function setFilter(key: string, value?: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.replace(`?${next.toString()}`);
  }

  function openNew() {
    setEditing(null);
    setVariants([]);
    setError("");
    setOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setVariants(p.variants);
    setError("");
    setOpen(true);
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input: ProductInput = {
      name: String(fd.get("name") ?? ""),
      categoryId: String(fd.get("categoryId") ?? ""),
      price: Number(fd.get("price") ?? 0),
      gstRate: Number(fd.get("gstRate") ?? 5),
      sku: String(fd.get("sku") ?? ""),
      barcode: String(fd.get("barcode") ?? ""),
      description: String(fd.get("description") ?? ""),
      imageUrl: String(fd.get("imageUrl") ?? ""),
      available: fd.get("available") === "on",
      variants,
    };
    startTransition(async () => {
      const r = await saveProduct(input, editing?.id);
      if (r.ok) {
        setOpen(false);
        toast.success(editing ? "Product updated" : "Product created");
      } else setError(r.error);
    });
  }

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={params.get("category") ?? "all"} onValueChange={(v) => setFilter("category", v === "all" ? undefined : String(v))}>
          <SelectTrigger className="w-44" aria-label="Filter category"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={params.get("available") ?? "all"} onValueChange={(v) => setFilter("available", v === "all" ? undefined : String(v))}>
          <SelectTrigger className="w-36" aria-label="Filter availability"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Available</SelectItem>
            <SelectItem value="false">Unavailable</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />} onClick={openNew}>
              <PlusIcon className="size-4" /> Add Product
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Product" : "New Product"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={submit} className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" defaultValue={editing?.name} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="categoryId">Category</Label>
                    <Select name="categoryId" defaultValue={editing?.categoryId}>
                      <SelectTrigger id="categoryId"><SelectValue placeholder="Pick…" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input id="price" name="price" type="number" step="0.01" min="0" defaultValue={editing?.price} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="gstRate">GST %</Label>
                    <Input id="gstRate" name="gstRate" type="number" step="0.1" min="0" max="28" defaultValue={editing?.gstRate ?? 5} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" name="sku" defaultValue={editing?.sku} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input id="barcode" name="barcode" defaultValue={editing?.barcode} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input id="imageUrl" name="imageUrl" defaultValue={editing?.imageUrl} />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" defaultValue={editing?.description} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="available" name="available" defaultChecked={editing?.available ?? true} />
                  <Label htmlFor="available">Available on POS</Label>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Variants</Label>
                    <Button type="button" variant="outline" size="sm"
                      onClick={() => setVariants([...variants, { id: `v-${Date.now()}`, name: "", priceDelta: 0 }])}>
                      <PlusIcon className="size-3" /> Add
                    </Button>
                  </div>
                  {variants.map((v, i) => (
                    <div key={v.id} className="flex items-center gap-2">
                      <Input placeholder="Name (e.g. Large)" value={v.name}
                        onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                      <Input type="number" step="0.01" className="w-28" placeholder="+₹" value={v.priceDelta}
                        onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, priceDelta: Number(e.target.value) } : x)))} />
                      <Button type="button" variant="ghost" size="icon" aria-label="Remove variant"
                        onClick={() => setVariants(variants.filter((_, j) => j !== i))}>
                        <XIcon className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}
                <DialogFooter>
                  <Button type="submit">Save</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {products.length === 0 ? (
        <EmptyState title="No products found" hint="Adjust filters or add a product." />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">GST</TableHead>
                <TableHead>Available</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">{p.name}</div>
                    {p.variants.length > 0 && (
                      <div className="mt-1 flex gap-1">
                        {p.variants.map((v) => (
                          <Badge key={v.id} variant="outline">{v.name} +{v.priceDelta}</Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{categories.find((c) => c.id === p.categoryId)?.name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                  <TableCell className="text-right tabular-nums">{inr(p.price)}</TableCell>
                  <TableCell className="text-right tabular-nums">{p.gstRate}%</TableCell>
                  <TableCell>
                    <Switch
                      checked={p.available}
                      aria-label={`Toggle ${p.name}`}
                      onCheckedChange={() =>
                        startTransition(async () => {
                          const r = await toggleProduct(p.id);
                          if (!r.ok) toast.error(r.error);
                        })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" aria-label={`Edit ${p.name}`} onClick={() => openEdit(p)}>
                        <PencilIcon className="size-4" />
                      </Button>
                      <ConfirmButton
                        title={`Delete ${p.name}?`}
                        description="Blocked while the product is part of an open order."
                        action={() => removeProduct(p.id)}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label={`Delete ${p.name}`}>
                            <Trash2Icon className="size-4 text-destructive" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
