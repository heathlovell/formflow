import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { SignOutButton } from "./sign-out-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.user?.role === "admin";

  const pastSubmissions = isAdmin
    ? []
    : await db.submission.findMany({
        where: { userId: session.user.id },
        include: {
          form: { select: { title: true } },
          answers: { include: { question: true } },
        },
        orderBy: { createdAt: "desc" },
      });

  const forms = await db.form.findMany({
    where: {},
    include: {
      questions: true,
      _count: { select: { submissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <span className="text-xl font-bold">FormFlow</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session.user?.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10">
        <h1 className="text-3xl font-bold">
          Welcome back, {session.user?.name || "there"}!
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isAdmin
            ? "All surveys across the platform."
            : "Here are your available surveys."}
        </p>

        {isAdmin && (
          <div className="mt-4 flex gap-3">
            <Link href="/admin/results">
              <Button variant="outline">View All Results</Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline">Manage Users</Button>
            </Link>
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Card key={form.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{form.title}</CardTitle>
                {form.description && (
                  <CardDescription>{form.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-end gap-3">
                <p className="text-sm text-muted-foreground">
                  {form.questions.length} question{form.questions.length !== 1 ? "s" : ""} &middot;{" "}
                  {form._count.submissions} response{form._count.submissions !== 1 ? "s" : ""}
                </p>
                <Link href={`/forms/${form.id}`}>
                  <Button className="w-full">Take Survey</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {forms.length === 0 && (
          <div className="mt-16 text-center text-muted-foreground">
            No surveys available yet.
          </div>
        )}

        {!isAdmin && pastSubmissions.length > 0 && (
          <>
            <h2 className="mt-12 text-2xl font-bold">My Past Submissions</h2>
            <p className="mt-2 text-muted-foreground">
              Your previous survey responses.
            </p>
            <div className="mt-6 space-y-4">
              {pastSubmissions.map((submission) => (
                <Card key={submission.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {submission.form.title}
                    </CardTitle>
                    <CardDescription>
                      Submitted{" "}
                      {new Date(submission.createdAt).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {submission.answers.map((answer) => (
                        <li key={answer.id} className="text-sm">
                          <span className="font-medium">
                            {answer.question.text}:
                          </span>{" "}
                          {answer.value}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
