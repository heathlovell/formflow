import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteUserButton } from "./delete-user-button";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user?.role !== "admin") {
    redirect("/dashboard");
  }

  const users = await db.user.findMany({
    include: {
      _count: { select: { submissions: true, forms: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <span className="text-xl font-bold">FormFlow</span>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="mt-2 text-muted-foreground">
          {users.length} user{users.length !== 1 ? "s" : ""} registered.
        </p>

        <div className="mt-8 space-y-3">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base">
                    {user.name || "Unnamed"}{" "}
                    {user.role === "admin" && (
                      <span className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        Admin
                      </span>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                {user.id !== session.user.id && (
                  <DeleteUserButton
                    userId={user.id}
                    userName={user.name || user.email}
                  />
                )}
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {user._count.forms} form{user._count.forms !== 1 ? "s" : ""} created
                  {" · "}
                  {user._count.submissions} submission{user._count.submissions !== 1 ? "s" : ""}
                  {" · "}
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
