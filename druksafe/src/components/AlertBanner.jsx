"use client";

export default function AlertBanner({ dataStatus, highRiskDistricts, t }) {
  if (highRiskDistricts.length) {
    return (
      <section className="alert-banner is-high">
        <div>
          <p>{t.alertActive}</p>
          <h2>
            {highRiskDistricts.map((district) => district.name).join(", ")} ·{" "}
            {t.thresholdHint}
          </h2>
        </div>
        <span>{highRiskDistricts[0].riskScore}/100</span>
      </section>
    );
  }

  if (dataStatus.stale) {
    return (
      <section className="alert-banner is-stale">
        <div>
          <p>{t.dataStale}</p>
          <h2>{dataStatus.message || t.staleWarning}</h2>
        </div>
        <span>{t.weatherError}</span>
      </section>
    );
  }

  return (
    <section className="alert-banner is-clear">
      <div>
        <p>{t.allClear}</p>
        <h2>{t.liveSynced}</h2>
      </div>
      <span>{t.autoRefresh} 15m</span>
    </section>
  );
}
