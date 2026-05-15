"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ALERT_COOLDOWN_MS,
  COPY,
  DISTRICTS,
  HIGH_RISK_THRESHOLD,
  REFRESH_INTERVAL_MS,
  buildFallbackReadings,
  composeAlertMessages,
  createSimulationReadings,
  enrichDistricts,
  getGlobalStatus,
} from "@/lib/druksafe-data";

const CACHE_KEY = "druksafe.latestReadings";
const RECIPIENT_GROUPS = [
  "Farmers",
  "Gups",
  "Dzongkhag disaster officers",
  "NCHM observers",
];

const INTEGRATIONS = [
  { name: "Open-Meteo", status: "Live API route", tone: "ready" },
  { name: "Risk engine", status: "Rules based", tone: "ready" },
  { name: "SMS", status: "Twilio ready, simulated now", tone: "watch" },
  { name: "Storage", status: "Browser cache prototype", tone: "watch" },
];

function readCachedReadings() {
  try {
    const cached = window.localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function saveCachedReadings(payload) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Local storage can be unavailable in private browsing modes.
  }
}

function formatTime(value) {
  if (!value) {
    return "Pending";
  }

  return new Intl.DateTimeFormat("en-BT", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function formatRelativeMinutes(value) {
  if (!value) {
    return "--";
  }

  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  return `${minutes}m`;
}

export default function Home() {
  const [language, setLanguage] = useState("en");
  const [mode, setMode] = useState("live");
  const [selectedId, setSelectedId] = useState("sarpang");
  const [liveReadings, setLiveReadings] = useState(buildFallbackReadings);
  const [dataStatus, setDataStatus] = useState({
    source: "Baseline",
    stale: true,
    loading: true,
    message: "Loading Open-Meteo forecast",
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [simulationRainfall, setSimulationRainfall] = useState(72);
  const [simulationRiver, setSimulationRiver] = useState(24);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [alertLog, setAlertLog] = useState([]);
  const lastAlertRef = useRef({});
  const t = COPY[language];

  const loadWeather = useCallback(async () => {
    setDataStatus((current) => ({
      ...current,
      loading: true,
      message: "Refreshing Open-Meteo forecast",
    }));

    try {
      const response = await fetch("/api/weather", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Weather service unavailable");
      }

      const payload = await response.json();
      setLiveReadings(payload.readings);
      setLastUpdated(payload.updatedAt);
      setDataStatus({
        source: payload.source,
        stale: Boolean(payload.stale),
        loading: false,
        message: "Live forecast active",
      });
      saveCachedReadings(payload);
    } catch {
      const cached = readCachedReadings();
      if (cached?.readings) {
        setLiveReadings(cached.readings);
        setLastUpdated(cached.updatedAt);
        setDataStatus({
          source: "Local cache",
          stale: true,
          loading: false,
          message: "Data Stale",
        });
        return;
      }

      const fallback = {
        source: "Demo baseline",
        updatedAt: new Date().toISOString(),
        readings: buildFallbackReadings(),
      };
      setLiveReadings(fallback.readings);
      setLastUpdated(fallback.updatedAt);
      setDataStatus({
        source: fallback.source,
        stale: true,
        loading: false,
        message: "Data Stale",
      });
    }
  }, []);

  useEffect(() => {
    const initialRefresh = window.setTimeout(loadWeather, 0);
    const interval = window.setInterval(loadWeather, REFRESH_INTERVAL_MS);

    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(interval);
    };
  }, [loadWeather]);

  useEffect(() => {
    if (!simulationRunning || mode !== "simulation") {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setSimulationRainfall((value) => Math.min(140, value + 4));
      setSimulationRiver((value) => Math.min(58, value + 2));
    }, 1400);

    return () => window.clearInterval(interval);
  }, [mode, simulationRunning]);

  const simulationReadings = useMemo(
    () => createSimulationReadings(simulationRainfall, simulationRiver),
    [simulationRainfall, simulationRiver]
  );
  const activeReadings = mode === "simulation" ? simulationReadings : liveReadings;
  const districts = useMemo(() => enrichDistricts(activeReadings), [activeReadings]);
  const selectedDistrict =
    districts.find((district) => district.id === selectedId) ?? districts[0];
  const globalStatus = getGlobalStatus(districts);
  const highestRisk = districts.reduce((highest, district) =>
    district.score > highest.score ? district : highest
  );
  const alertSignature = districts
    .map((district) => `${district.id}:${district.score}`)
    .join("|");

  useEffect(() => {
    if (mode === "live" && dataStatus.loading) {
      return;
    }

    const highRiskDistricts = districts.filter(
      (district) => district.score >= HIGH_RISK_THRESHOLD
    );
    const now = Date.now();

    highRiskDistricts.forEach((district) => {
      const previousAlertAt = lastAlertRef.current[district.id] ?? 0;
      if (now - previousAlertAt < ALERT_COOLDOWN_MS) {
        return;
      }

      lastAlertRef.current[district.id] = now;
      const messages = composeAlertMessages(district, COPY.en.action);
      const alert = {
        id: `${district.id}-${now}`,
        district: district.name,
        score: district.score,
        mode,
        sentAt: new Date(now).toISOString(),
        messages,
      };

      setAlertLog((current) => [alert, ...current].slice(0, 6));

      fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          district: district.name,
          score: district.score,
          messages,
          recipients: [],
        }),
      }).catch(() => {});
    });
  }, [alertSignature, dataStatus.loading, districts, mode]);

  const statCards = [
    {
      label: t.globalStatus,
      value: t[globalStatus.copyKey],
      detail: mode === "simulation" ? t.simulation : t.live,
      tone: globalStatus.key,
    },
    {
      label: t.highestRisk,
      value: `${highestRisk.name} ${highestRisk.score}`,
      detail: highestRisk.level.label,
      tone: highestRisk.level.key,
    },
    {
      label: t.districtsWatched,
      value: String(DISTRICTS.length),
      detail: "Punakha, Wangdue, Sarpang, Samtse",
      tone: "neutral",
    },
    {
      label: t.smsQueue,
      value: alertLog.length ? `${alertLog.length}` : "0",
      detail: t.demoFallback,
      tone: alertLog.length ? "high" : "neutral",
    },
  ];

  function startSimulation() {
    setMode("simulation");
    setSimulationRunning(true);
  }

  function resetSimulation() {
    setSimulationRainfall(72);
    setSimulationRiver(24);
    setSimulationRunning(false);
  }

  return (
    <main className="min-h-screen w-full bg-[#f4f7f5] text-[#172625]">
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
                { value: "dz", label: "རྫོང་ཁ" },
              ]}
              value={language}
              onChange={setLanguage}
            />
            <SegmentedControl
              label="Mode"
              className="mode-control"
              options={[
                { value: "live", label: t.live },
                { value: "simulation", label: t.simulation },
              ]}
              value={mode}
              onChange={(nextMode) => {
                setMode(nextMode);
                setSimulationRunning(nextMode === "simulation");
              }}
            />
            <button
              className="h-10 rounded-md border border-[#b9c9c2] bg-white px-3 text-sm font-semibold text-[#21413d] transition hover:bg-[#edf4f1]"
              onClick={loadWeather}
              type="button"
            >
              {t.refresh}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:px-8">
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

        <section className="grid min-w-0 gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="min-w-0 rounded-lg border border-[#d8e2dc] bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">{t.mapTitle}</h2>
                <p className="text-sm text-[#667871]">{t.mapSubtitle}</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-[#5d6f69]">
                <LegendDot color="#047857" label="Low" />
                <LegendDot color="#b54708" label="Moderate" />
                <LegendDot color="#b42318" label="High" />
              </div>
            </div>
            <FloodMap
              districts={districts}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>

          <DistrictDetail district={selectedDistrict} t={t} />
        </section>

        <section className="grid min-w-0 gap-5 xl:grid-cols-[0.9fr_0.7fr_0.9fr]">
          <TrendPanel district={selectedDistrict} t={t} />

          <SimulationPanel
            mode={mode}
            running={simulationRunning}
            rainfall={simulationRainfall}
            river={simulationRiver}
            t={t}
            onRainfall={setSimulationRainfall}
            onRiver={setSimulationRiver}
            onStart={startSimulation}
            onStop={() => setSimulationRunning(false)}
            onReset={resetSimulation}
          />

          <AlertPanel alerts={alertLog} selectedDistrict={selectedDistrict} t={t} />
        </section>

        <section className="grid min-w-0 gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <AdminPanel t={t} />
          <IntegrationPanel />
        </section>
      </div>
    </main>
  );
}

function SegmentedControl({ className = "", label, options, value, onChange }) {
  return (
    <div
      className={`segmented-control flex h-10 shrink-0 items-center rounded-md border border-[#b9c9c2] bg-[#f6faf8] p-1 ${className}`}
    >
      <span className="sr-only">{label}</span>
      {options.map((option) => (
        <button
          className={`h-8 whitespace-nowrap rounded px-3 text-sm font-semibold transition ${
            value === option.value
              ? "bg-[#0f5c5c] text-white shadow-sm"
              : "text-[#46615b] hover:bg-white"
          }`}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function MetricCard({ label, value, detail, tone }) {
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
      <p className="mt-2 break-words text-2xl font-semibold text-[#172625]">{value}</p>
      <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#667871]">{detail}</p>
    </div>
  );
}

function StatusRow({ label, value }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-4">
      <span className="shrink-0 text-[#667871]">{label}</span>
      <span className="min-w-0 break-words text-right font-semibold text-[#243f3b]">
        {value}
      </span>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function FloodMap({ districts, selectedId, onSelect }) {
  return (
    <div className="map-canvas" aria-label="Bhutan district flood risk map">
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 1000 520"
      >
        <path
          className="map-river"
          d="M58 292 C168 218 246 258 333 198 C430 130 536 160 625 228 C718 298 810 268 938 196"
        />
        <path
          className="map-river map-river-secondary"
          d="M392 74 C448 142 456 202 426 272 C398 339 426 410 496 474"
        />
        <path
          className="map-outline"
          d="M87 255 C156 124 282 99 402 122 C520 144 600 88 722 116 C824 139 900 196 925 285 C837 324 813 401 702 417 C586 434 497 384 408 421 C305 463 197 420 145 349 C116 309 91 298 87 255 Z"
        />
      </svg>

      <div className="map-grid" />

      {districts.map((district) => (
        <button
          className={`district-marker ${selectedId === district.id ? "is-selected" : ""}`}
          key={district.id}
          onClick={() => onSelect(district.id)}
          style={{
            left: district.map.left,
            top: district.map.top,
            "--risk-color": district.level.color,
            "--risk-soft": district.level.soft,
          }}
          type="button"
        >
          <span className="district-marker-dot" />
          <span className="min-w-0 truncate">{district.name}</span>
          <strong>{district.score}</strong>
        </button>
      ))}
    </div>
  );
}

function DistrictDetail({ district, t }) {
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

function ReadingTile({ label, value }) {
  return (
    <div className="min-w-0 rounded-md border border-[#d8e2dc] bg-[#f8fbf9] p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6d7d78]">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold leading-5 text-[#203a36]">
        {value}
      </p>
    </div>
  );
}

function TrendPanel({ district, t }) {
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
          <div className="flex flex-1 flex-col items-center gap-2" key={`${district.id}-${index}`}>
            <div
              className="w-full rounded-t-sm bg-[#16817a]"
              style={{ height: `${Math.max(8, (value / maxValue) * 135)}px` }}
              title={`${value} mm`}
            />
            <span className="text-[11px] font-semibold text-[#7a8984]">{index + 1}</span>
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

function SimulationPanel({
  mode,
  running,
  rainfall,
  river,
  t,
  onRainfall,
  onRiver,
  onStart,
  onStop,
  onReset,
}) {
  return (
    <section className="rounded-lg border border-[#d8e2dc] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{t.simulateEvent}</h2>
          <p className="text-sm text-[#667871]">
            {mode === "simulation" ? t.simulation : "Ready for training mode"}
          </p>
        </div>
        <span
          className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
            mode === "simulation"
              ? "bg-[#fef0c7] text-[#7a2e0e]"
              : "bg-[#eef6f4] text-[#0f5c5c]"
          }`}
        >
          {mode === "simulation" ? t.simulation : t.live}
        </span>
      </div>

      <div className="mt-6 grid gap-5">
        <RangeControl
          label={t.rainSlider}
          max={140}
          min={0}
          suffix="mm"
          value={rainfall}
          onChange={onRainfall}
        />
        <RangeControl
          label={t.riverSlider}
          max={60}
          min={0}
          suffix="%"
          value={river}
          onChange={onRiver}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <button
          className="rounded-md bg-[#0f5c5c] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0b4f4e]"
          onClick={running ? onStop : onStart}
          type="button"
        >
          {running ? t.stopSimulation : t.simulateEvent}
        </button>
        <button
          className="rounded-md border border-[#b9c9c2] px-3 py-2 text-sm font-semibold text-[#21413d] transition hover:bg-[#edf4f1]"
          onClick={onReset}
          type="button"
        >
          {t.resetSimulation}
        </button>
      </div>
    </section>
  );
}

function RangeControl({ label, min, max, value, suffix, onChange }) {
  return (
    <label className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-[#304b46]">{label}</span>
        <span className="rounded bg-[#eef6f4] px-2 py-1 font-semibold text-[#0f5c5c]">
          {value}
          {suffix}
        </span>
      </div>
      <input
        className="accent-[#0f5c5c]"
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        type="range"
        value={value}
      />
    </label>
  );
}

function AlertPanel({ alerts, selectedDistrict, t }) {
  const preview = composeAlertMessages(selectedDistrict, COPY.en.action);

  return (
    <section className="rounded-lg border border-[#d8e2dc] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{t.smsAlerts}</h2>
          <p className="text-sm text-[#667871]">{t.recipients}: {RECIPIENT_GROUPS.join(", ")}</p>
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
        <p className="mb-3 text-sm font-semibold text-[#304b46]">Recent dispatches</p>
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
          <p className="rounded-md bg-[#f8fbf9] p-3 text-sm text-[#667871]">{t.noAlerts}</p>
        )}
      </div>
    </section>
  );
}

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

function AdminPanel({ t }) {
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

function IntegrationPanel() {
  return (
    <section className="rounded-lg border border-[#d8e2dc] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Prototype integrations</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {INTEGRATIONS.map((item) => (
          <div
            className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-[#d8e2dc] bg-[#f8fbf9] p-3"
            key={item.name}
          >
            <div>
              <p className="font-semibold text-[#243f3b]">{item.name}</p>
              <p className="text-sm text-[#667871]">{item.status}</p>
            </div>
            <span
              className={`h-2.5 w-2.5 rounded-sm ${
                item.tone === "ready" ? "bg-[#047857]" : "bg-[#b54708]"
              }`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
