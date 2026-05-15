export default function MetricCard({ label, value, detail, tone }) {
  const toneClass =
    tone === "high"
      ? "border-[#fecdca] bg-[#fff5f4]"
      : tone === "advisory"
        ? "border-[#fedf89] bg-[#fffbeb]"
        : tone === "clear"
          ? "border-[#abefc6] bg-[#f0fdf4]"
          : "border-[#d8e2dc] bg-white";

  return (
    <div className={`min-w-0 rounded-lg border p-4 shadow-sm ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#60756e]">
        {label}
      </p>
      <p className="mt-2 break-words text-2xl font-semibold text-[#172625]">
        {value}
      </p>
      <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#667871]">
        {detail}
      </p>
    </div>
  );
}
