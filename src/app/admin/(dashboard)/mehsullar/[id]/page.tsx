import { notFound } from "next/navigation";
import { getProductById } from "@/actions/products";
import { getCategories, getBrands } from "@/actions/catalog";
import { ProductForm } from "@/components/admin/ProductForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, categories, brands] = await Promise.all([
    getProductById(id),
    getCategories({ admin: true }),
    getBrands({ admin: true }),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="display-font text-3xl mb-8">Redaktə: {product.name as string}</h1>
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
        initial={product as never}
      />
    </div>
  );
}
