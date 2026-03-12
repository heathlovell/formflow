import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;

  const form = await db.form.findUnique({
    where: { id: formId },
    include: {
      questions: { orderBy: { order: "asc" } },
    },
  });

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  return NextResponse.json(form);
}
