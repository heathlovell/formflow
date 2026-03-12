import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { formId } = await params;
  const { answers } = await req.json();

  // answers should be: [{ questionId: string, value: string }, ...]
  if (!answers || !Array.isArray(answers)) {
    return NextResponse.json(
      { error: "Answers are required" },
      { status: 400 }
    );
  }

  const submission = await db.submission.create({
    data: {
      formId,
      userId: session.user.id,
      answers: {
        create: answers.map(
          (a: { questionId: string; value: string }) => ({
            questionId: a.questionId,
            value: a.value,
          })
        ),
      },
    },
    include: { answers: true },
  });

  return NextResponse.json(submission, { status: 201 });
}
