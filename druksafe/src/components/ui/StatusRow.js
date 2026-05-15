export default function StatusRow({ label, value }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-4">
      <span className="shrink-0 text-[#667871]">{label}</span>
      <span className="min-w-0 break-words text-right font-semibold text-[#243f3b]">
        {value}
      </span>
    </div>
  );
}
