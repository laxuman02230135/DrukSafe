"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DISTRICTS } from "@/data/districts";
import { useSimulationControls } from "@/hooks/useSimulationControls";
import { useWeatherReadings } from "@/hooks/useWeatherReadings";
import {
  HIGH_RISK_THRESHOLD,
  enrichDistricts,
  getGlobalStatus,
} from "@/lib/riskEngine";
import { getTranslation } from "@/lib/translations";
import { formatRelativeMinutes, formatTime } from "@/lib/formatters";
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

function DistrictFocus({ district, t }) {
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
          value={
            district.riverDischarge === null
              ? "--"
              : `${district.riverDischarge} m3/s`
          }
        />
        <DetailMetric label={t.basin} value={district.basin} />
        <DetailMetric label={t.lead} value={district.lead} />
      </div>
    </section>
  );
}

function MapFeaturePanel({ district, t }) {
  const markerStatus =
    district.riskScore > HIGH_RISK_THRESHOLD ? t.alertActive : district.level.status;

  return (
    <section className="dashboard-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">District map features</p>
          <h2>{district.name} monitoring layer</h2>
        </div>
        <span
          className="status-badge"
          style={{
            "--chip-color": district.level.color,
            "--chip-bg": district.level.soft,
          }}
        >
          {markerStatus}
        </span>
      </div>

      <div className="detail-grid">
        <DetailMetric label="Map marker" value={`${district.latitude}, ${district.longitude}`} />
        <DetailMetric label="River system" value={district.river} />
        <DetailMetric label={t.threshold} value={`${HIGH_RISK_THRESHOLD}/100`} />
        <DetailMetric label={t.source} value={district.floodSource ?? "Estimated"} />
      </div>
    </section>
  );
}

export default function DistrictExplorer({ initialDistrictId = "sarpang" }) {
  const [language, setLanguage] = useState("en");
  const [selectedId, setSelectedId] = useState(() =>
    DISTRICTS.some((district) => district.id === initialDistrictId)
      ? initialDistrictId
      : "sarpang"
  );
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
  const highestRisk = districts.reduce((highest, district) =>
    district.riskScore > highest.riskScore ? district : highest
  );

  function handleSelect(districtId) {
    setSelectedId(districtId);

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("district", districtId);
    window.history.replaceState(null, "", `${nextUrl.pathname}${nextUrl.search}`);
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
            <p className="eyebrow">{t.mapTitle}</p>
            <h1>District Risk Map</h1>
            <p>
              {selectedDistrict.name} is showing {selectedDistrict.riskScore}/100
              risk from {selectedDistrict.rainfall} mm rainfall and{" "}
              {selectedDistrict.riverRise}% river rise.
            </p>
            <div className="district-route-actions">
              <Link className="primary-button" href="/dashboard">
                Open dashboard
              </Link>
              <Link className="secondary-button" href="/">
                Landing page
              </Link>
            </div>
          </div>
          <div className="hero-stats">
            <StatCard
              label={t.globalStatus}
              tone={globalStatus.key}
              value={t[globalStatus.copyKey]}
            />
            <StatCard
              label={t.highestRisk}
              tone={highestRisk.level.key}
              value={`${highestRisk.name} ${highestRisk.riskScore}`}
            />
            <StatCard label={t.districtsWatched} value={String(DISTRICTS.length)} />
            <StatCard
              label={t.lastUpdated}
              tone={dataStatus.stale ? "medium" : "low"}
              value={formatRelativeMinutes(lastUpdated)}
            />
          </div>
        </section>

        <section className="meta-strip">
          <span>
            {t.lastUpdated}: <strong>{formatTime(lastUpdated)}</strong>
          </span>
          <span>
            {t.source}: <strong>{dataStatus.source}</strong>
          </span>
          <span>
            {t.selectedDistrict}: <strong>{selectedDistrict.name}</strong>
          </span>
        </section>

        <section className="dashboard-grid">
          <FloodMap
            districts={districts}
            onSelect={handleSelect}
            selectedId={selectedId}
            t={t}
          />
          <DistrictFocus district={selectedDistrict} t={t} />
        </section>

        <section className="risk-card-grid">
          {districts.map((district) => (
            <RiskCard
              district={district}
              isSelected={district.id === selectedId}
              key={district.id}
              onSelect={handleSelect}
              t={t}
            />
          ))}
        </section>

        <section className="dashboard-grid three-column">
          <RainChart district={selectedDistrict} t={t} />
          <MapFeaturePanel district={selectedDistrict} t={t} />
          <section className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{t.recipients}</p>
                <h2>{selectedDistrict.lead}</h2>
              </div>
              <span className="metric-pill">{selectedDistrict.population}</span>
            </div>
            <div className="detail-grid">
              <DetailMetric label={t.basin} value={selectedDistrict.basin} />
              <DetailMetric label={t.riskScore} value={selectedDistrict.riskScore} />
              <DetailMetric label={t.rainfall} value={`${selectedDistrict.rainfall} mm`} />
              <DetailMetric label={t.riverRise} value={`${selectedDistrict.riverRise}%`} />
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
