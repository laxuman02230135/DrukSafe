import ReadingTile from "@/components/ui/ReadingTile";

export default function DistrictDetail({ district, t }) {
  return (
    <aside className="rounded-lg border border-[#d8e2dc] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.1em] text-[#0f766e]">
            {t.selectedDistrict}
          </p>
          <h2 className="mt-2 text-2xl font-semibold">{district.name}</h2>
          <p className="mt-1 text-lg text-[#667871]">{district.dzongkha}</p>
        </div>
        <div
          className="rounded-md px-3 py-2 text-sm font-semibold"
          style={{ backgroundColor: district.level.soft, color: district.level.text }}
        >
          {district.level.label}
        </div>
      </div>

      <div className="mt-6 grid place-items-center">
        <div
          className="risk-ring"
          style={{
            background: `conic-gradient(${district.level.color} ${
              district.score * 3.6
            }deg, #e6ece9 0deg)`,
          }}
        >
          <div className="risk-ring-inner">
            <span>{district.score}</span>
            <small>/100</small>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ReadingTile label={t.rainfall} value={`${district.rainfall} mm`} />
        <ReadingTile label={t.riverRise} value={`${district.riverRise}%`} />
        <ReadingTile label="Basin" value={district.basin} />
        <ReadingTile label="Lead" value={district.lead} />
      </div>
    </aside>
  );
}
