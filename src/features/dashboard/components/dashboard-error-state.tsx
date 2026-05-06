export function DashboardErrorState({ message }: { message: string }) {
  return (
    <div className="space-y-8">
      <h1 className="text-[28px] font-semibold tracking-normal text-[#1b212d]">
        Dashboard
      </h1>
      <section className="rounded-lg border border-[#f2f4f7] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#1b212d]">
          Financial overview unavailable
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[#929eae]">{message}</p>
      </section>
    </div>
  );
}
