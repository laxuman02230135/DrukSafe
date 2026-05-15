import { COPY, HIGH_RISK_THRESHOLD, composeAlertMessages } from "@/lib/druksafe-data";
import { RECIPIENT_GROUPS } from "@/lib/dashboard-config";
import { formatTime } from "@/lib/formatters";

function MessagePreview({ label, message }) {
  return (
    <div className="rounded-md border border-[#d8e2dc] bg-[#f8fbf9] p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#60756e]">
        {label}
      </p>
      <p className="mt-2 break-words text-sm leading-6 text-[#263f3b]">{message}</p>
    </div>
  );
}

export default function AlertPanel({ alerts, selectedDistrict, t }) {
  const preview = composeAlertMessages(selectedDistrict, COPY.en.action);

  return (
    <section className="rounded-lg border border-[#d8e2dc] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{t.smsAlerts}</h2>
          <p className="text-sm text-[#667871]">
            {t.recipients}: {RECIPIENT_GROUPS.join(", ")}
          </p>
        </div>
        <span className="rounded-md bg-[#fff4ed] px-2.5 py-1 text-xs font-semibold text-[#9a3412]">
          {HIGH_RISK_THRESHOLD}+
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        <MessagePreview label={t.english} message={preview.english} />
        <MessagePreview label={t.dzongkha} message={preview.dzongkha} />
      </div>

      <div className="mt-5 border-t border-[#e0e8e4] pt-4">
        <p className="mb-3 text-sm font-semibold text-[#304b46]">
          Recent dispatches
        </p>
        {alerts.length ? (
          <div className="grid gap-2">
            {alerts.map((alert) => (
              <div
                className="rounded-md border border-[#fedf89] bg-[#fffbeb] p-3 text-sm"
                key={alert.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <strong>{alert.district}</strong>
                  <span className="text-[#7a2e0e]">{formatTime(alert.sentAt)}</span>
                </div>
                <p className="mt-1 text-[#6d3b0f]">
                  Risk {alert.score}/100 via {alert.mode}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-md bg-[#f8fbf9] p-3 text-sm text-[#667871]">
            {t.noAlerts}
          </p>
        )}
      </div>
    </section>
  );
}
