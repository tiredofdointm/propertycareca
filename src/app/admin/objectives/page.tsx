import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { objectives } from "@/lib/db/schema";
import { ObjectivesBoard } from "@/components/admin/ObjectivesBoard";

export const dynamic = "force-dynamic";

export default async function AdminObjectivesPage() {
  const all = await db
    .select()
    .from(objectives)
    .orderBy(desc(objectives.createdAt))
    .limit(500);

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-dark">Objectives</h1>
      <p className="mt-2 max-w-2xl text-sm text-foreground/60">
        The business roadmap: every objective records when we started it, when
        we finished it, and how done we think it is. Add new objectives any
        time &mdash; this list is meant to grow.
      </p>
      <div className="mt-8">
        <ObjectivesBoard
          initialObjectives={all.map((objective) => ({
            ...objective,
            startedAt: objective.startedAt?.toISOString() ?? null,
            completedAt: objective.completedAt?.toISOString() ?? null,
            createdAt: objective.createdAt.toISOString(),
            updatedAt: objective.updatedAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
