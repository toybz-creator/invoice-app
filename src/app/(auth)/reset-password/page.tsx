import { AuthCard } from "@/features/auth/components/auth-card";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata = {
  title: "Reset Password",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{
    secret?: string;
    userId?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;

  return (
    <AuthCard
      title="Create new password"
      subtitle="Choose a secure password for your account"
      footerText="Back to"
      footerHref="/login"
      footerLinkText="Sign in"
      underlineClassName="w-11"
    >
      <ResetPasswordForm userId={params.userId} secret={params.secret} />
    </AuthCard>
  );
}
