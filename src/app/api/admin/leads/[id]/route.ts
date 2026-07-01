import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { leadStatusSchema } from "@/lib/validation";
import { parseIdParam, readJsonBody } from "@/lib/api-utils";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const leadId = parseIdParam(id);
  if (leadId === null) {
    return NextResponse.json({ error: "Invalid lead id" }, { status: 400 });
  }

  const body = await readJsonBody(request);
  if (!body.ok) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = leadStatusSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const [updated] = await db
    .update(leads)
    .set({ status: parsed.data.status })
    .where(eq(leads.id, leadId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({ lead: updated });
}
