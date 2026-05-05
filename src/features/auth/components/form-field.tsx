import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type FormFieldProps = ComponentPropsWithoutRef<"input"> & {
  label: string;
  error?: string;
};

export function FormField({
  id,
  label,
  error,
  className,
  ...props
}: FormFieldProps) {
  const errorId = error && id ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-[#1b212d]">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={cn(
          "h-12 w-full rounded-[10px] border border-[#f2f2f2] bg-white px-5 text-sm font-medium text-[#1b212d] outline-none transition placeholder:text-[#78778b] focus:border-[#c8ee44] focus:ring-3 focus:ring-[#c8ee44]/30 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15",
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-sm leading-5 text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
