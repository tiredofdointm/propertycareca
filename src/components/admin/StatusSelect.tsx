"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StatusSelect({
  endpoint,
  currentStatus,
  options,
}: {
  endpoint: string;
  currentStatus: string;
  options: readonly string[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value;
    const previous = status;
    setStatus(next);
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!response.ok) {
        setStatus(previous);
        const body = await response.json().catch(() => null);
        setError(body?.error ?? "Couldn't update status. Please try again.");
      } else {
        router.refresh();
      }
    } catch {
      setStatus(previous);
      setError("Couldn't update status. Please check your connection.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <select
        value={status}
        onChange={handleChange}
        disabled={saving}
        className="rounded-lg border border-black/10 px-2 py-1 text-xs font-medium capitalize shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replace(/_/g, " ")}
          </option>
        ))}
      </select>
      {error ? (
        <p role="alert" className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
