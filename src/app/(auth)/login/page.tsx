import { AuthCard } from "@/features/auth/components/auth-card";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Welcome back! Please enter your details"
      footerText="Don't have an account?"
      footerHref="/signup"
      footerLinkText="Sign up for free"
    >
      <LoginForm />
    </AuthCard>
  );
}
