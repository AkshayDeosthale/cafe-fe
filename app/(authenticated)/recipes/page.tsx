import { getProducts } from "@/lib/actions/catalog";
import { getIngredients, getRecipes } from "@/lib/actions/inventory";
import { PageHeader } from "@/components/shared/page-header";
import { RecipesClient } from "@/features/recipes/client";


export default async function RecipesPage() {
  const [products, ingredients, recipes] = await Promise.all([
    getProducts({ pageSize: 200 }),
    getIngredients({ pageSize: 100 }),
    getRecipes(),
  ]);
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <PageHeader title="Recipes" description="Ingredient mapping per product — drives stock deduction & food cost" />
      <RecipesClient products={products.items} ingredients={ingredients.items} recipes={recipes} />
    </div>
  );
}

export const dynamic = "force-dynamic";
