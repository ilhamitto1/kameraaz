import { getCategories } from "@/actions/catalog";
import { CategoriesAdmin } from "@/components/admin/CategoriesAdmin";

export default async function AdminCategoriesPage() {
  const categories = await getCategories({ admin: true });
  return (
    <div>
      <h1 className="display-font text-3xl mb-8">Kateqoriyalar</h1>
      <CategoriesAdmin initial={categories as never} />
    </div>
  );
}
