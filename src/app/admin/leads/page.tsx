import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { leads, leadStatusEnum } from "@/lib/db/schema";
import { getServiceBySlug, formatDateTime } from "@/lib/services-data";
import { StatusSelect } from "@/components/admin/StatusSelect";

const LEADS_LIMIT = 200;

export default async function AdminLeadsPage() {
  const allLeads = await db
    .select()
    .from(leads)
    .orderBy(desc(leads.createdAt))
    .limit(LEADS_LIMIT);

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-dark">
        Leads ({allLeads.length}
        {allLeads.length === LEADS_LIMIT ? "+" : ""})
      </h1>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-black/5 text-xs uppercase text-foreground/50">
            <tr>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {allLeads.map((lead) => (
              <tr key={lead.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">
                    {lead.name}
                    {lead.plan === "enterprise" ? (
                      <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                        Enterprise
                      </span>
                    ) : null}
                  </p>
                  <p className="text-foreground/60">{lead.email}</p>
                  <p className="text-foreground/60">{lead.phone}</p>
                </td>
                <td className="px-4 py-3">
                  {getServiceBySlug(lead.serviceSlug)?.name ?? lead.serviceSlug}
                </td>
                <td className="max-w-[200px] px-4 py-3">{lead.address}</td>
                <td className="max-w-[240px] px-4 py-3 text-foreground/70">
                  {lead.message || "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-foreground/60">
                  {formatDateTime(lead.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <StatusSelect
                    endpoint={`/api/admin/leads/${lead.id}`}
                    currentStatus={lead.status}
                    options={leadStatusEnum.enumValues}
                  />
                </td>
              </tr>
            ))}
            {allLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-foreground/50">
                  No leads yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
