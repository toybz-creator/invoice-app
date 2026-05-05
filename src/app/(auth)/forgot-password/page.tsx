import { AuthCard } from "@/features/auth/components/auth-card";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata = {
  title: "Forgot Password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset password"
      subtitle="Enter your email and we'll send a reset link"
      footerText="Remember your password?"
      footerHref="/login"
      footerLinkText="Sign in"
      underlineClassName="w-11"
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
