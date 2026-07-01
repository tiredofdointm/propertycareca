import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { bookingStatusSchema } from "@/lib/validation";
import { parseIdParam, readJsonBody } from "@/lib/api-utils";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const bookingId = parseIdParam(id);
  if (bookingId === null) {
    return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
  }

  const body = await readJsonBody(request);
  if (!body.ok) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = bookingStatusSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const [updated] = await db
    .update(bookings)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(bookings.id, bookingId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({ booking: updated });
}
