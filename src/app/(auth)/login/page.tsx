import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          Welcome back
        </p>
        <h1 className="text-3xl font-semibold tracking-normal">Sign in</h1>
        <p className="text-muted-foreground">
          The validated Appwrite login form is scheduled for Phase 3.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Auth form placeholder. This route exists so the app shell, navigation,
        and route group structure can be verified in Phase 1.
      </div>

      <Button asChild variant="outline">
        <Link href="/signup">Create an account</Link>
      </Button>
    </div>
  );
}
