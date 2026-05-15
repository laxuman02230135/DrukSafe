import { formatRelativeMinutes, formatTime } from "@/lib/formatters";
import MetricCard from "@/components/ui/MetricCard";
import StatusRow from "@/components/ui/StatusRow";

export default function DashboardSummary({
  dataStatus,
  lastUpdated,
  mode,
  statCards,
  t,
}) {
  return (
    <section className="grid min-w-0 gap-4 lg:grid-cols-[1.25fr_0.75fr]">
      <div className="min-w-0 rounded-lg border border-[#d8e2dc] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#0f766e]">
              {mode === "simulation" ? t.simulation : t.live}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[#172625] sm:text-4xl">
              {t.operations}
            </h1>
            <p className="mt-3 max-w-2xl break-words text-base leading-7 text-[#5d6f69]">
              Predictive rainfall, estimated river rise, and SMS readiness for
              Bhutan&apos;s highest-risk v1 dzongkhags.
            </p>
          </div>
          <div className="grid w-full gap-2 rounded-md border border-[#d8e2dc] bg-[#f7faf8] p-3 text-sm md:min-w-48 md:w-auto">
            <StatusRow label={t.lastUpdated} value={formatTime(lastUpdated)} />
            <StatusRow label="Age" value={formatRelativeMinutes(lastUpdated)} />
            <StatusRow label={t.source} value={dataStatus.source} />
          </div>
        </div>

        {dataStatus.stale ? (
          <div className="mt-4 rounded-md border border-[#f5c77e] bg-[#fff8e6] px-4 py-3 text-sm font-medium text-[#7a4b00]">
            {t.dataStale}: {t.staleWarning}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {statCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>
    </section>
  );
}
