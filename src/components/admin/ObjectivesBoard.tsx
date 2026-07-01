"use client";

import { useMemo, useState, type FormEvent } from "react";

export type ObjectiveItem = {
  id: number;
  title: string;
  details: string | null;
  status: "not_started" | "in_progress" | "completed";
  percentComplete: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const statusLabels: Record<ObjectiveItem["status"], string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

const statusStyles: Record<ObjectiveItem["status"], string> = {
  not_started: "bg-background text-foreground/60",
  in_progress: "bg-accent/15 text-accent",
  completed: "bg-brand-light text-brand-dark",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US");
}

export function ObjectivesBoard({
  initialObjectives,
}: {
  initialObjectives: ObjectiveItem[];
}) {
  const [items, setItems] = useState(initialObjectives);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | "new" | null>(null);

  const counts = useMemo(() => {
    const completed = items.filter((item) => item.status === "completed");
    const inProgress = items.filter((item) => item.status === "in_progress");
    const overall =
      items.length === 0
        ? 0
        : Math.round(
            items.reduce((sum, item) => sum + item.percentComplete, 0) /
              items.length
          );
    return {
      total: items.length,
      started: inProgress.length,
      completed: completed.length,
      overall,
    };
  }, [items]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusyId("new");
    try {
      const response = await fetch("/api/admin/objectives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, details }),
      });
      const body = await response.json().catch(() => null);
      if (response.ok && body?.objective) {
        setItems((current) => [body.objective, ...current]);
        setTitle("");
        setDetails("");
      } else {
        setError(body?.error ?? "Could not add the objective.");
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function patch(id: number, payload: Record<string, unknown>) {
    setError(null);
    setBusyId(id);
    try {
      const response = await fetch(`/api/admin/objectives/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => null);
      if (response.ok && body?.objective) {
        setItems((current) =>
          current.map((item) => (item.id === id ? body.objective : item))
        );
      } else {
        setError(body?.error ?? "Could not update the objective.");
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: number) {
    if (!window.confirm("Delete this objective? This cannot be undone.")) {
      return;
    }
    setError(null);
    setBusyId(id);
    try {
      const response = await fetch(`/api/admin/objectives/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setItems((current) => current.filter((item) => item.id !== id));
      } else {
        setError("Could not delete the objective.");
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Objectives", value: counts.total },
          { label: "In progress", value: counts.started },
          { label: "Completed", value: counts.completed },
          { label: "Overall progress", value: `${counts.overall}%` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-line bg-surface p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase text-foreground/50">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-brand-dark">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-line bg-surface p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-brand-dark">
          Add an objective
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <input
              aria-label="Objective title"
              type="text"
              required
              minLength={3}
              placeholder="What do we want to get done?"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white/60 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
            <textarea
              aria-label="Objective details"
              rows={2}
              placeholder="Details (optional)"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white/60 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
          <button
            type="submit"
            disabled={busyId === "new"}
            className="h-fit rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            {busyId === "new" ? "Adding..." : "Add objective"}
          </button>
        </div>
      </form>

      {error ? (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-line bg-surface p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[item.status]}`}
                  >
                    {statusLabels[item.status]}
                  </span>
                </div>
                {item.details ? (
                  <p className="mt-1 max-w-2xl text-sm text-foreground/70">
                    {item.details}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-foreground/50">
                  Started: {formatDate(item.startedAt)} &middot; Completed:{" "}
                  {formatDate(item.completedAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(item.id)}
                disabled={busyId === item.id}
                className="text-xs font-medium text-red-600 hover:underline disabled:opacity-60"
              >
                Delete
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex min-w-[220px] flex-1 items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-background">
                  <div
                    className="h-full rounded-full bg-brand transition-all"
                    style={{ width: `${item.percentComplete}%` }}
                  />
                </div>
                <span className="w-12 text-right text-sm font-semibold text-brand-dark">
                  {item.percentComplete}%
                </span>
              </div>
              <input
                aria-label={`${item.title} percent complete`}
                type="range"
                min={0}
                max={100}
                step={5}
                value={item.percentComplete}
                disabled={busyId === item.id}
                onChange={(event) =>
                  setItems((current) =>
                    current.map((row) =>
                      row.id === item.id
                        ? { ...row, percentComplete: Number(event.target.value) }
                        : row
                    )
                  )
                }
                onMouseUp={(event) =>
                  patch(item.id, {
                    percentComplete: Number(
                      (event.target as HTMLInputElement).value
                    ),
                  })
                }
                onTouchEnd={(event) =>
                  patch(item.id, {
                    percentComplete: Number(
                      (event.target as HTMLInputElement).value
                    ),
                  })
                }
                className="w-40 accent-[var(--brand)]"
              />
              <select
                aria-label={`${item.title} status`}
                value={item.status}
                disabled={busyId === item.id}
                onChange={(event) =>
                  patch(item.id, { status: event.target.value })
                }
                className="rounded-lg border border-black/10 bg-white/60 px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
        {items.length === 0 ? (
          <p className="rounded-2xl border border-line bg-surface p-8 text-center text-sm text-foreground/50">
            No objectives yet — add the first one above.
          </p>
        ) : null}
      </div>
    </div>
  );
}
