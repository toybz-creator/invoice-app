"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { signupAction } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { FormField } from "@/features/auth/components/form-field";
import {
  type SignupInput,
  signupSchema,
} from "@/features/auth/schemas/auth.schema";

export function SignupForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    formState: { errors, isValid },
    handleSubmit,
    register,
    setError,
  } = useForm<SignupInput>({
    mode: "onChange",
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(values: SignupInput) {
    startTransition(async () => {
      const result = await signupAction(values);

      if (!result.ok) {
        Object.entries(result.fieldErrors ?? {}).forEach(
          ([field, messages]) => {
            setError(field as keyof SignupInput, { message: messages[0] });
          },
        );
        toast.error(result.error);
        return;
      }

      toast.success(result.message);
      router.replace("/");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-3">
        <FormField
          id="name"
          label="Full Name"
          type="text"
          autoComplete="name"
          placeholder="Mahfuzul Nabil"
          disabled={isPending}
          error={errors.name?.message}
          {...register("name")}
        />
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="example@gmail.com"
          disabled={isPending}
          error={errors.email?.message}
          {...register("email")}
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="Password"
          disabled={isPending}
          error={errors.password?.message}
          {...register("password")}
        />
      </div>

      <Button
        type="submit"
        disabled={isPending || !isValid}
        className="h-12 w-full rounded-[10px] bg-[#c8ee44] text-base font-semibold text-[#1b212d] hover:bg-[#bce42f]"
      >
        {isPending ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
