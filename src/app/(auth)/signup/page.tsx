import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Sign Up",
};

export default function SignupPage() {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          Start managing finances
        </p>
        <h1 className="text-3xl font-semibold tracking-normal">
          Create account
        </h1>
        <p className="text-muted-foreground">
          The production signup form with Zod validation and Appwrite Auth lands
          in Phase 3.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Signup form placeholder. The final UI will be implemented from the Maglo
        Figma sign-up frame.
      </div>

      <Button asChild variant="outline">
        <Link href="/login">I already have an account</Link>
      </Button>
    </div>
  );
}
