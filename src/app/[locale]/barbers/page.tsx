import { notFound } from "next/navigation";
import { BarberList } from "@/components/BarberList";
import { getBarbers } from "@/lib/sanity/queries";

export default async function BarbersPage() {
  if ((await getBarbers()).length === 0) notFound();
  return (
    <main id="main" className="flex-1 text-ink">
      <BarberList />
    </main>
  );
}
