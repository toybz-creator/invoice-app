import { Loader2 } from "lucide-react";

export function PageLoadingState({ label }: { label: string }) {
  return (
    <div className="flex h-[calc(100vh-100px)] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#1ba37b]" />
        <p className="text-sm font-medium text-[#929eae]">{label}</p>
      </div>
    </div>
  );
}
