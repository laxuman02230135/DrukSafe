import SegmentedControl from "@/components/ui/SegmentedControl";

export default function AppHeader({
  globalStatus,
  language,
  mode,
  t,
  onLanguageChange,
  onModeChange,
  onRefresh,
}) {
  return (
    <header className="border-b border-[#d8e2dc] bg-white/92 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[#0f5c5c] text-sm font-bold text-white">
            DS
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold leading-6">{t.appName}</p>
            <p className="line-clamp-2 text-sm text-[#5d6f69]">{t.strapline}</p>
          </div>
        </div>

        <div className="header-controls flex w-full max-w-full flex-wrap items-center gap-2 lg:w-auto">
          <div
            className="status-pill rounded-md px-3 py-2 text-sm font-semibold"
            style={{ backgroundColor: globalStatus.soft, color: globalStatus.color }}
          >
            {t[globalStatus.copyKey]}
          </div>
          <SegmentedControl
            label={t.language}
            options={[
              { value: "en", label: "EN" },
              { value: "dz", label: "Dz" },
            ]}
            value={language}
            onChange={onLanguageChange}
          />
          <SegmentedControl
            label="Mode"
            className="mode-control"
            options={[
              { value: "live", label: t.live },
              { value: "simulation", label: t.simulation },
            ]}
            value={mode}
            onChange={onModeChange}
          />
          <button
            className="h-10 rounded-md border border-[#b9c9c2] bg-white px-3 text-sm font-semibold text-[#21413d] transition hover:bg-[#edf4f1]"
            onClick={onRefresh}
            type="button"
          >
            {t.refresh}
          </button>
        </div>
      </div>
    </header>
  );
}
