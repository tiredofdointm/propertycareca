import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { leadFormSchema } from "@/lib/validation";
import { readJsonBody, zodFieldErrors } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const body = await readJsonBody(request);
  if (!body.ok) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = leadFormSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please fix the highlighted fields.",
        fieldErrors: zodFieldErrors(parsed.error),
      },
      { status: 400 }
    );
  }

  const { name, email, phone, address, serviceSlug, message } = parsed.data;

  const [lead] = await db
    .insert(leads)
    .values({
      name,
      email,
      phone,
      address,
      serviceSlug,
      message: message || null,
    })
    .returning({ id: leads.id });

  return NextResponse.json({ id: lead.id }, { status: 201 });
}
