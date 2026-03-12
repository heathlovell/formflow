import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <span className="text-xl font-bold">FormFlow</span>
          <nav className="flex gap-3">
            {session ? (
              <>
                <span className="flex items-center text-sm text-muted-foreground">
                  {session.user?.email}
                </span>
                <Link href="/dashboard">
                  <Button size="sm">Dashboard</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            Build beautiful forms,
            <br />
            <span className="text-muted-foreground">get better answers.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Create conversational forms, surveys, and quizzes that people enjoy
            filling out. Get higher completion rates and more thoughtful
            responses.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/signup">
              <Button size="lg">Get started for free</Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        FormFlow &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
