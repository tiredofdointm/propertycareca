import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";

export async function GET() {
  const allBookings = await db
    .select()
    .from(bookings)
    .orderBy(desc(bookings.createdAt));
  return NextResponse.json({ bookings: allBookings });
}
