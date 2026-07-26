import { getCategories, getBrands } from "@/actions/catalog";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([getCategories({ admin: true }), getBrands({ admin: true })]);
  return (
    <div>
      <h1 className="display-font text-3xl mb-8">Yeni məhsul</h1>
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
      />
    </div>
  );
}
