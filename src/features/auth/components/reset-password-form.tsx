"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { resetPasswordAction } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { FormField } from "@/features/auth/components/form-field";
import {
  type ResetPasswordInput,
  resetPasswordSchema,
} from "@/features/auth/schemas/auth.schema";

type ResetPasswordFormProps = {
  secret?: string;
  userId?: string;
};

export function ResetPasswordForm({
  secret = "",
  userId = "",
}: ResetPasswordFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const hasValidLink = Boolean(userId && secret);
  const {
    formState: { errors, isValid },
    handleSubmit,
    register,
    setError,
  } = useForm<ResetPasswordInput>({
    mode: "onChange",
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      userId,
      secret,
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: ResetPasswordInput) {
    startTransition(async () => {
      const result = await resetPasswordAction(values);

      if (!result.ok) {
        Object.entries(result.fieldErrors ?? {}).forEach(
          ([field, messages]) => {
            setError(field as keyof ResetPasswordInput, {
              message: messages[0],
            });
          },
        );
        toast.error(result.error);
        return;
      }

      toast.success(result.message);
      router.replace("/login");
      router.refresh();
    });
  }

  if (!hasValidLink) {
    return (
      <div className="space-y-5">
        <p className="rounded-[10px] border border-destructive/20 bg-destructive/5 p-4 text-sm leading-6 text-destructive">
          This password reset link is missing required information. Request a
          new reset link and try again.
        </p>
        <Button
          asChild
          className="h-12 w-full rounded-[10px] bg-[#c8ee44] text-base font-semibold text-[#1b212d] hover:bg-[#bce42f]"
        >
          <Link href="/forgot-password">Request new link</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <input type="hidden" {...register("userId")} />
      <input type="hidden" {...register("secret")} />

      <div className="space-y-3">
        <FormField
          id="password"
          label="New password"
          type="password"
          autoComplete="new-password"
          placeholder="New password"
          disabled={isPending}
          error={errors.password?.message}
          {...register("password")}
        />
        <FormField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Confirm password"
          disabled={isPending}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
      </div>

      <Button
        type="submit"
        disabled={isPending || !isValid}
        className="h-12 w-full rounded-[10px] bg-[#c8ee44] text-base font-semibold text-[#1b212d] hover:bg-[#bce42f]"
      >
        {isPending ? "Updating password..." : "Update password"}
      </Button>
    </form>
  );
}
