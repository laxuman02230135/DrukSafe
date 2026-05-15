import StatusRow from "@/components/ui/StatusRow";

export default function TrendPanel({ district, t }) {
  const maxValue = Math.max(100, ...district.history);

  return (
    <section className="rounded-lg border border-[#d8e2dc] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{t.forecast}</h2>
          <p className="text-sm text-[#667871]">{district.name}</p>
        </div>
        <span className="rounded-md bg-[#eef6f4] px-2.5 py-1 text-xs font-semibold text-[#0f5c5c]">
          {t.riskScore} {district.score}
        </span>
      </div>
      <div className="mt-6 flex h-44 items-end gap-2 border-b border-l border-[#cddbd5] px-2 pb-2">
        {district.history.map((value, index) => (
          <div
            className="flex flex-1 flex-col items-center gap-2"
            key={`${district.id}-${index}`}
          >
            <div
              className="w-full rounded-t-sm bg-[#16817a]"
              style={{ height: `${Math.max(8, (value / maxValue) * 135)}px` }}
              title={`${value} mm`}
            />
            <span className="text-[11px] font-semibold text-[#7a8984]">
              {index + 1}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
        <StatusRow label="Peak" value={`${Math.max(...district.history)} mm`} />
        <StatusRow label="Now" value={`${district.rainfall} mm`} />
        <StatusRow label="Rise" value={`${district.riverRise}%`} />
      </div>
    </section>
  );
}
