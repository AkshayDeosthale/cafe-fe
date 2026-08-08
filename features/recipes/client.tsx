"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { saveRecipe } from "@/lib/actions/inventory";
import type { Ingredient, Product, Recipe, RecipeLine } from "@/lib/types";
import { inr } from "@/lib/utils/format";
import { PlusIcon, XIcon } from "lucide-react";

export function RecipesClient({
  products,
  ingredients,
  recipes,
}: {
  products: Product[];
  ingredients: Ingredient[];
  recipes: Recipe[];
}) {
  const [selectedId, setSelectedId] = useState(products[0]?.id ?? "");
  const [edited, setEdited] = useState<Record<string, RecipeLine[]>>({});
  const [, startTransition] = useTransition();

  const product = products.find((p) => p.id === selectedId);
  const baseLines = recipes.find((r) => r.productId === selectedId)?.lines ?? [];
  const lines = edited[selectedId] ?? baseLines;

  const cost = useMemo(
    () =>
      lines.reduce((sum, l) => {
        const ing = ingredients.find((i) => i.id === l.ingredientId);
        return sum + (ing ? ing.unitCost * l.qty : 0);
      }, 0),
    [lines, ingredients]
  );
  const foodCostPct = product && product.price > 0 ? (cost / product.price) * 100 : 0;

  const missing = products.filter((p) => !recipes.some((r) => r.productId === p.id) && !edited[p.id]);

  function setLines(next: RecipeLine[]) {
    setEdited({ ...edited, [selectedId]: next });
  }

  function save() {
    startTransition(async () => {
      const r = await saveRecipe({ productId: selectedId, lines });
      if (r.ok) toast.success("Recipe saved");
      else toast.error(r.error);
    });
  }

  return (
    <div className="grid gap-4 px-4 lg:grid-cols-[280px_1fr] lg:px-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Products</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-1">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent ${p.id === selectedId ? "bg-accent font-medium" : ""}`}
            >
              <span>{p.name}</span>
              {missing.some((m) => m.id === p.id) && <Badge variant="destructive">No recipe</Badge>}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {product?.name ?? "Select a product"}
            {product && <span className="ml-2 text-sm font-normal text-muted-foreground">sells at {inr(product.price)}</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {lines.map((l, i) => {
            const ing = ingredients.find((x) => x.id === l.ingredientId);
            return (
              <div key={i} className="grid grid-cols-[1fr_100px_80px_36px] items-center gap-2">
                <Select value={l.ingredientId} onValueChange={(v) => setLines(lines.map((x, j) => (j === i ? { ...x, ingredientId: String(v) } : x)))}>
                  <SelectTrigger aria-label="Ingredient"><SelectValue placeholder="Ingredient…" /></SelectTrigger>
                  <SelectContent>
                    {ingredients.map((x) => <SelectItem key={x.id} value={x.id}>{x.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input type="number" min="0.01" step="0.01" value={l.qty} aria-label="Qty"
                  onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, qty: Number(e.target.value) } : x)))} />
                <span className="text-sm text-muted-foreground">{ing?.unit ?? "—"}</span>
                <Button type="button" variant="ghost" size="icon" aria-label="Remove line"
                  onClick={() => setLines(lines.filter((_, j) => j !== i))}>
                  <XIcon className="size-4" />
                </Button>
              </div>
            );
          })}
          <div>
            <Button type="button" variant="outline" size="sm"
              onClick={() => setLines([...lines, { ingredientId: ingredients[0]?.id ?? "", qty: 1 }])}>
              <PlusIcon className="size-3" /> Ingredient
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-md border p-3 text-sm">
            <span>Recipe cost: <span className="font-semibold">{inr(cost)}</span></span>
            <span>
              Food cost:{" "}
              <Badge variant={foodCostPct > 40 ? "destructive" : foodCostPct > 30 ? "outline" : "secondary"}>
                {foodCostPct.toFixed(1)}%
              </Badge>
            </span>
            <span className="text-muted-foreground">healthy ≤ 30–35%</span>
            <Button className="ml-auto" onClick={save} disabled={lines.length === 0}>Save Recipe</Button>
          </div>
          <Label className="text-xs text-muted-foreground">
            Stock deducts automatically at checkout using this recipe.
          </Label>
        </CardContent>
      </Card>
    </div>
  );
}
