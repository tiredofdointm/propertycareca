import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, bookingStatusEnum } from "@/lib/db/schema";
import { getServiceBySlug, formatCents } from "@/lib/services-data";
import { StatusSelect } from "@/components/admin/StatusSelect";

const BOOKINGS_LIMIT = 200;

export default async function AdminBookingsPage() {
  const allBookings = await db
    .select()
    .from(bookings)
    .orderBy(desc(bookings.createdAt))
    .limit(BOOKINGS_LIMIT);

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-dark">
        Bookings ({allBookings.length}
        {allBookings.length === BOOKINGS_LIMIT ? "+" : ""})
      </h1>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-black/5 text-xs uppercase text-foreground/50">
            <tr>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Deposit</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {allBookings.map((booking) => (
              <tr key={booking.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{booking.name}</p>
                  <p className="text-foreground/60">{booking.email}</p>
                  <p className="text-foreground/60">{booking.phone}</p>
                </td>
                <td className="px-4 py-3">
                  {getServiceBySlug(booking.serviceSlug)?.name ?? booking.serviceSlug}
                </td>
                <td className="whitespace-nowrap px-4 py-3">{booking.preferredDate}</td>
                <td className="max-w-[200px] px-4 py-3">{booking.address}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  {formatCents(booking.depositAmountCents)}
                </td>
                <td className="px-4 py-3">
                  <StatusSelect
                    endpoint={`/api/admin/bookings/${booking.id}`}
                    currentStatus={booking.status}
                    options={bookingStatusEnum.enumValues}
                  />
                </td>
              </tr>
            ))}
            {allBookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-foreground/50">
                  No bookings yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
