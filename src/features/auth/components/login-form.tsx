"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { loginAction } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { FormField } from "@/features/auth/components/form-field";
import {
  type LoginInput,
  loginSchema,
} from "@/features/auth/schemas/auth.schema";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    formState: { errors, isValid },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginInput>({
    mode: "onChange",
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  function onSubmit(values: LoginInput) {
    startTransition(async () => {
      const result = await loginAction(values);

      if (!result.ok) {
        Object.entries(result.fieldErrors ?? {}).forEach(
          ([field, messages]) => {
            setError(field as keyof LoginInput, { message: messages[0] });
          },
        );
        toast.error(result.error);
        return;
      }

      toast.success(result.message);
      router.replace("/dashboard");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-3">
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          disabled={isPending}
          error={errors.email?.message}
          {...register("email")}
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          disabled={isPending}
          error={errors.password?.message}
          {...register("password")}
        />
      </div>

      <div className="flex items-center justify-between gap-4 text-sm">
        <label className="flex items-center gap-2 font-medium text-[#1b212d]">
          <input
            type="checkbox"
            className="size-4 rounded-[3px] border-[#929eae] accent-[#c8ee44]"
            disabled={isPending}
            {...register("remember")}
          />
          Remember for 30 Days
        </label>
        <Link
          href="/forgot-password"
          className="font-medium text-[#1b212d] outline-none hover:underline focus-visible:ring-3 focus-visible:ring-[#c8ee44]/50"
        >
          Forgot password
        </Link>
      </div>

      <Button
        type="submit"
        disabled={isPending || !isValid}
        className="h-12 w-full rounded-[10px] bg-[#c8ee44] text-base font-semibold text-[#1b212d] hover:bg-[#bce42f]"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
