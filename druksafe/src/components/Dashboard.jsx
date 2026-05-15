"use client";

import { useMemo, useState } from "react";
import { ALERT_RECIPIENTS, DISTRICTS } from "@/data/districts";
import { useFloodAlerts } from "@/hooks/useFloodAlerts";
import { useSimulationControls } from "@/hooks/useSimulationControls";
import { useWeatherReadings } from "@/hooks/useWeatherReadings";
import { HIGH_RISK_THRESHOLD, enrichDistricts, getGlobalStatus } from "@/lib/riskEngine";
import { getTranslation } from "@/lib/translations";
import { formatRelativeMinutes, formatTime } from "@/lib/formatters";
import AlertBanner from "@/components/AlertBanner";
import FloodMap from "@/components/FloodMap";
import Navbar from "@/components/Navbar";
import RainChart from "@/components/RainChart";
import RiskCard from "@/components/RiskCard";

function StatCard({ label, tone = "neutral", value }) {
  return (
    <div className={`stat-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DetailMetric({ label, value }) {
  return (
    <div className="detail-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SkeletonCards() {
  return (
    <div className="skeleton-grid" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

function RangeControl({ label, max, min, onChange, suffix, value }) {
  const roundedValue = Math.round(value);
  const handlePreciseInput = (event) => {
    const nextValue = Number(event.target.value);

    if (Number.isFinite(nextValue)) {
      onChange(Math.min(max, Math.max(min, nextValue)));
    }
  };

  return (
    <label className="range-control">
      <span>
        <span>{label}</span>
        <span className="range-value">
          <input
            aria-label={`${label} value`}
            inputMode="numeric"
            onChange={handlePreciseInput}
            type="text"
            value={roundedValue}
          />
          <strong>{suffix}</strong>
        </span>
      </span>
      <input
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        type="range"
        value={roundedValue}
      />
    </label>
  );
}

function SimulationControls({
  mode,
  rainValue,
  riverValue,
  running,
  t,
  onRainfall,
  onReset,
  onRiver,
  onStart,
  onStop,
}) {
  return (
    <section className="dashboard-panel control-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{mode === "live" ? t.liveData : t.simulation}</p>
          <h2>{mode === "live" ? t.liveSynced : t.manualMode}</h2>
        </div>
        <span className="metric-pill">{HIGH_RISK_THRESHOLD}+</span>
      </div>

      <div className="control-stack">
        <RangeControl
          label={t.rainSlider}
          max={150}
          min={0}
          onChange={onRainfall}
          suffix="mm"
          value={rainValue}
        />
        <RangeControl
          label={t.riverSlider}
          max={75}
          min={0}
          onChange={onRiver}
          suffix="%"
          value={riverValue}
        />
      </div>

      <div className="control-actions">
        <button className="primary-button" onClick={running ? onStop : onStart} type="button">
          {running ? t.stopSimulation : t.simulateEvent}
        </button>
        <button className="secondary-button" onClick={onReset} type="button">
          {t.resetSimulation}
        </button>
      </div>
    </section>
  );
}

function DistrictDetail({ district, t }) {
  return (
    <section
      className="dashboard-panel district-focus"
      style={{
        "--risk-color": district.level.color,
        "--risk-bg": district.level.soft,
      }}
    >
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{t.selectedDistrict}</p>
          <h2>{district.name}</h2>
          <span className="district-script">{district.dzongkha}</span>
        </div>
        <span className="status-badge">{district.level.label}</span>
      </div>

      <div className="score-orbit">
        <div
          className="score-ring"
          style={{
            background: `conic-gradient(${district.level.color} ${
              district.riskScore * 3.6
            }deg, rgba(255, 255, 255, 0.08) 0deg)`,
          }}
        >
          <div>
            <strong>{district.riskScore}</strong>
            <span>/100</span>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <DetailMetric label={t.rainfall} value={`${district.rainfall} mm`} />
        <DetailMetric label={t.riverRise} value={`${district.riverRise}%`} />
        <DetailMetric
          label={t.rainChance}
          value={
            district.precipitationProbability === null
              ? "--"
              : `${district.precipitationProbability}%`
          }
        />
        <DetailMetric
          label={t.riverFlow}
          value={district.riverDischarge === null ? "--" : `${district.riverDischarge} m3/s`}
        />
        <DetailMetric label={t.basin} value={district.basin} />
        <DetailMetric label={t.lead} value={district.lead} />
      </div>
    </section>
  );
}

function SmsPanel({ alerts, selectedDistrict, t }) {
  return (
    <section className="dashboard-panel sms-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{t.smsAlerts}</p>
          <h2>
            {t.phoneTarget}: {ALERT_RECIPIENTS[0].phone}
          </h2>
        </div>
        <span className="metric-pill">{HIGH_RISK_THRESHOLD}+</span>
      </div>

      <div className="sms-template">
        <p>{t.english}</p>
        <span>
          Flood alert for {selectedDistrict.name}: risk {selectedDistrict.riskScore}/100,
          rainfall {selectedDistrict.rainfall} mm, river rise {selectedDistrict.riverRise}%.
        </span>
      </div>

      <div className="dispatch-list">
        {alerts.length ? (
          alerts.map((alert) => (
            <div className="dispatch-item" key={alert.id}>
              <div>
                <strong>{alert.district}</strong>
                <span>
                  {alert.mode === "simulation" ? t.manualTrigger : t.liveTrigger} ·{" "}
                  {formatTime(alert.sentAt)}
                </span>
              </div>
              <em>{alert.score}</em>
            </div>
          ))
        ) : (
          <div className="empty-state">{t.noAlerts}</div>
        )}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const [language, setLanguage] = useState("en");
  const [selectedId, setSelectedId] = useState("sarpang");
  const t = getTranslation(language);
  const { dataStatus, lastUpdated, liveReadings, refreshWeather } =
    useWeatherReadings();
  const simulation = useSimulationControls();
  const activeReadings =
    simulation.mode === "simulation" ? simulation.simulationReadings : liveReadings;
  const districts = useMemo(() => enrichDistricts(activeReadings), [activeReadings]);
  const selectedDistrict =
    districts.find((district) => district.id === selectedId) ?? districts[0];
  const globalStatus = getGlobalStatus(districts);
  const highRiskDistricts = districts.filter(
    (district) => district.riskScore > HIGH_RISK_THRESHOLD
  );
  const highestRisk = districts.reduce((highest, district) =>
    district.riskScore > highest.riskScore ? district : highest
  );
  const { alertLog } = useFloodAlerts({
    dataLoading: dataStatus.loading,
    districts,
    mode: simulation.mode,
  });
  const rainValue =
    simulation.mode === "live"
      ? selectedDistrict.rainfall
      : simulation.simulationRainfall;
  const riverValue =
    simulation.mode === "live" ? selectedDistrict.riverRise : simulation.simulationRiver;

  function enterManualMode() {
    if (simulation.mode !== "simulation") {
      simulation.changeMode("simulation");
    }
  }

  function handleRainfall(value) {
    enterManualMode();
    simulation.setSimulationRainfall(value);
  }

  function handleRiver(value) {
    enterManualMode();
    simulation.setSimulationRiver(value);
  }

  return (
    <main className="dashboard-shell">
      <Navbar
        globalStatus={globalStatus}
        language={language}
        mode={simulation.mode}
        onLanguageChange={setLanguage}
        onModeChange={simulation.changeMode}
        onRefresh={refreshWeather}
        refreshing={dataStatus.loading}
        t={t}
      />

      <div className="dashboard-content">
        <section className="dashboard-hero">
          <div>
            <p className="eyebrow">{simulation.mode === "live" ? t.liveData : t.simulation}</p>
            <h1>{t.operations}</h1>
            <p>{t.thresholdHint}</p>
          </div>
          <div className="hero-stats">
            <StatCard label={t.globalStatus} tone={globalStatus.key} value={t[globalStatus.copyKey]} />
            <StatCard
              label={t.highestRisk}
              tone={highestRisk.level.key}
              value={`${highestRisk.name} ${highestRisk.riskScore}`}
            />
            <StatCard label={t.districtsWatched} value={String(DISTRICTS.length)} />
            <StatCard label={t.smsQueue} tone={alertLog.length ? "high" : "neutral"} value={String(alertLog.length)} />
          </div>
        </section>

        <AlertBanner
          dataStatus={dataStatus}
          highRiskDistricts={highRiskDistricts}
          t={t}
        />

        <section className="meta-strip">
          <span>
            {t.lastUpdated}: <strong>{formatTime(lastUpdated)}</strong>
          </span>
          <span>
            Age: <strong>{formatRelativeMinutes(lastUpdated)}</strong>
          </span>
          <span>
            {t.source}: <strong>{dataStatus.source}</strong>
          </span>
        </section>

        {dataStatus.loading ? <SkeletonCards /> : null}

        <section className="risk-card-grid">
          {districts.map((district) => (
            <RiskCard
              district={district}
              isSelected={district.id === selectedId}
              key={district.id}
              onSelect={setSelectedId}
              t={t}
            />
          ))}
        </section>

        <section className="dashboard-grid">
          <FloodMap
            districts={districts}
            onSelect={setSelectedId}
            selectedId={selectedId}
            t={t}
          />
          <DistrictDetail district={selectedDistrict} t={t} />
        </section>

        <section className="dashboard-grid three-column">
          <RainChart district={selectedDistrict} t={t} />
          <SimulationControls
            mode={simulation.mode}
            onRainfall={handleRainfall}
            onReset={simulation.resetSimulation}
            onRiver={handleRiver}
            onStart={simulation.startSimulation}
            onStop={simulation.stopSimulation}
            rainValue={rainValue}
            riverValue={riverValue}
            running={simulation.simulationRunning}
            t={t}
          />
          <SmsPanel alerts={alertLog} selectedDistrict={selectedDistrict} t={t} />
        </section>
      </div>
    </main>
  );
}
