import { AuthCard } from "@/features/auth/components/auth-card";
import { SignupForm } from "@/features/auth/components/signup-form";

export const metadata = {
  title: "Sign Up",
};

export default function SignupPage() {
  return (
    <AuthCard
      title="Create new account"
      subtitle="Welcome back! Please enter your details"
      footerText="Already have an account?"
      footerHref="/login"
      footerLinkText="Sign in"
      underlineClassName="w-11"
    >
      <SignupForm />
    </AuthCard>
  );
}
