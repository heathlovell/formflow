"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResetPasswordButton({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to reset the password for ${userName}?`
      )
    )
      return;

    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      setPassword("");
      setOpen(false);
      router.refresh();
      alert("Password has been reset successfully.");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to reset password");
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Reset Password
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="h-8 w-44"
        autoFocus
      />
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Saving..." : "Save"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setOpen(false);
          setPassword("");
          setError("");
        }}
      >
        Cancel
      </Button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </form>
  );
}
