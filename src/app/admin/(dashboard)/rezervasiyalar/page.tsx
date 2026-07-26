import { getBookings } from "@/actions/admin";
import { getProducts } from "@/actions/products";
import { BookingsAdmin } from "@/components/admin/BookingsAdmin";

export default async function AdminBookingsPage() {
  const [bookings, products] = await Promise.all([
    getBookings(),
    getProducts({ admin: true, pageSize: 200 }),
  ]);
  return (
    <div>
      <h1 className="display-font text-3xl mb-8">Rezervasiyalar</h1>
      <BookingsAdmin
        bookings={bookings as never}
        products={products.items.map((p) => ({ id: p.id as string, name: p.name as string }))}
      />
    </div>
  );
}
