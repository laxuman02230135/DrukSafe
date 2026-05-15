"use client";

import LanguageToggle from "@/components/LanguageToggle";

export default function Navbar({
  globalStatus,
  language,
  mode,
  t,
  onLanguageChange,
  onModeChange,
  onRefresh,
  refreshing,
}) {
  return (
    <header className="dashboard-navbar">
      <div className="dashboard-navbar-inner">
        <div className="brand-lockup">
          <div className="brand-mark">DS</div>
          <div className="min-w-0">
            <p className="brand-name">{t.appName}</p>
            <p className="brand-subtitle">{t.strapline}</p>
          </div>
        </div>

        <div className="nav-actions">
          <div
            className="status-chip"
            style={{
              "--chip-color": globalStatus.color,
              "--chip-bg": globalStatus.soft,
            }}
          >
            {t[globalStatus.copyKey]}
          </div>

          <LanguageToggle language={language} onChange={onLanguageChange} />

          <div className="mode-toggle" aria-label="Dashboard mode">
            {[
              { value: "live", label: t.live },
              { value: "simulation", label: t.simulation },
            ].map((option) => (
              <button
                className={mode === option.value ? "is-active" : ""}
                key={option.value}
                onClick={() => onModeChange(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>

          <button className="ghost-button" onClick={onRefresh} type="button">
            {refreshing ? t.refreshing : t.refresh}
          </button>
        </div>
      </div>
    </header>
  );
}
