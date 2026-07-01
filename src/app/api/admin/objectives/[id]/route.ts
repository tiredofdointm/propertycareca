import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { objectives } from "@/lib/db/schema";
import { objectiveUpdateSchema } from "@/lib/validation";
import { parseIdParam, readJsonBody, zodFieldErrors } from "@/lib/api-utils";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const objectiveId = parseIdParam(id);
  if (objectiveId === null) {
    return NextResponse.json({ error: "Invalid objective id" }, { status: 400 });
  }

  const body = await readJsonBody(request);
  if (!body.ok) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = objectiveUpdateSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please fix the highlighted fields.",
        fieldErrors: zodFieldErrors(parsed.error),
      },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(objectives)
    .where(eq(objectives.id, objectiveId))
    .limit(1);
  if (!existing) {
    return NextResponse.json({ error: "Objective not found" }, { status: 404 });
  }

  const { title, details, status, percentComplete } = parsed.data;

  // Keep status and progress consistent: starting work stamps startedAt,
  // completing stamps completedAt and forces 100%, and setting a progress
  // percentage nudges the status to match.
  let nextStatus = status ?? existing.status;
  let nextPercent = percentComplete ?? existing.percentComplete;
  if (status === "completed") nextPercent = 100;
  if (status === "not_started" && percentComplete === undefined) nextPercent = 0;
  if (percentComplete !== undefined && status === undefined) {
    if (percentComplete >= 100) nextStatus = "completed";
    else if (percentComplete > 0 && existing.status === "not_started") {
      nextStatus = "in_progress";
    } else if (percentComplete < 100 && existing.status === "completed") {
      nextStatus = "in_progress";
    }
  }

  const now = new Date();
  const [updated] = await db
    .update(objectives)
    .set({
      ...(title !== undefined ? { title } : {}),
      ...(details !== undefined ? { details: details || null } : {}),
      status: nextStatus,
      percentComplete: nextPercent,
      startedAt:
        existing.startedAt ??
        (nextStatus === "in_progress" || nextStatus === "completed"
          ? now
          : null),
      completedAt:
        nextStatus === "completed" ? (existing.completedAt ?? now) : null,
      updatedAt: now,
    })
    .where(eq(objectives.id, objectiveId))
    .returning();

  return NextResponse.json({ objective: updated });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const objectiveId = parseIdParam(id);
  if (objectiveId === null) {
    return NextResponse.json({ error: "Invalid objective id" }, { status: 400 });
  }

  await db.delete(objectives).where(eq(objectives.id, objectiveId));
  return NextResponse.json({ ok: true });
}
