import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";

export async function GET() {
  const allLeads = await db.select().from(leads).orderBy(desc(leads.createdAt));
  return NextResponse.json({ leads: allLeads });
}
