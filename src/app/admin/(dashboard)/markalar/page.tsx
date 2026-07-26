import { getBrands } from "@/actions/catalog";
import { BrandsAdmin } from "@/components/admin/BrandsAdmin";

export default async function AdminBrandsPage() {
  const brands = await getBrands({ admin: true });
  return (
    <div>
      <h1 className="display-font text-3xl mb-8">Markalar</h1>
      <BrandsAdmin initial={brands as never} />
    </div>
  );
}
