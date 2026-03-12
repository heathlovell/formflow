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

  const forms = await db.form.findMany({
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
          Here are your available surveys.
        </p>

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
      </main>
    </div>
  );
}
