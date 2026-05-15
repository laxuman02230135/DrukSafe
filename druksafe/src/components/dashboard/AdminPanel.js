import { HIGH_RISK_THRESHOLD } from "@/lib/druksafe-data";
import ReadingTile from "@/components/ui/ReadingTile";

export default function AdminPanel({ t }) {
  return (
    <section className="rounded-lg border border-[#d8e2dc] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{t.admin}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <ReadingTile label={t.threshold} value={`${HIGH_RISK_THRESHOLD}/100`} />
        <ReadingTile label={t.cooldown} value="1 hour" />
        <ReadingTile label="Refresh" value={`15 ${t.minutes}`} />
      </div>
    </section>
  );
}
