import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { objectives } from "@/lib/db/schema";
import { objectiveCreateSchema } from "@/lib/validation";
import { readJsonBody, zodFieldErrors } from "@/lib/api-utils";

export async function GET() {
  const all = await db
    .select()
    .from(objectives)
    .orderBy(desc(objectives.createdAt))
    .limit(500);
  return NextResponse.json({ objectives: all });
}

export async function POST(request: NextRequest) {
  const body = await readJsonBody(request);
  if (!body.ok) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = objectiveCreateSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please fix the highlighted fields.",
        fieldErrors: zodFieldErrors(parsed.error),
      },
      { status: 400 }
    );
  }

  const [created] = await db
    .insert(objectives)
    .values({
      title: parsed.data.title,
      details: parsed.data.details || null,
    })
    .returning();

  return NextResponse.json({ objective: created }, { status: 201 });
}
