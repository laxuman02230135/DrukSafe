"use client";

import { useMemo, useState } from "react";
import {
  COPY,
  DISTRICTS,
  enrichDistricts,
  getGlobalStatus,
} from "@/lib/druksafe-data";
import { useFloodAlerts } from "@/hooks/useFloodAlerts";
import { useSimulationControls } from "@/hooks/useSimulationControls";
import { useWeatherReadings } from "@/hooks/useWeatherReadings";
import FloodRiskMap from "@/components/maps/FloodRiskMap";
import AdminPanel from "@/components/dashboard/AdminPanel";
import AlertPanel from "@/components/dashboard/AlertPanel";
import AppHeader from "@/components/dashboard/AppHeader";
import DashboardSummary from "@/components/dashboard/DashboardSummary";
import DistrictDetail from "@/components/dashboard/DistrictDetail";
import IntegrationPanel from "@/components/dashboard/IntegrationPanel";
import SimulationPanel from "@/components/dashboard/SimulationPanel";
import TrendPanel from "@/components/dashboard/TrendPanel";
import LegendDot from "@/components/ui/LegendDot";

export default function DrukSafeDashboard() {
  const [language, setLanguage] = useState("en");
  const [selectedId, setSelectedId] = useState("sarpang");
  const t = COPY[language];
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
    district.score > highest.score ? district : highest
  );
  const { alertLog } = useFloodAlerts({
    dataLoading: dataStatus.loading,
    districts,
    mode: simulation.mode,
  });

  const statCards = useMemo(
    () => [
      {
        label: t.globalStatus,
        value: t[globalStatus.copyKey],
        detail: simulation.mode === "simulation" ? t.simulation : t.live,
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
    ],
    [alertLog.length, globalStatus, highestRisk, simulation.mode, t]
  );

  return (
    <main className="min-h-screen w-full bg-[#f4f7f5] text-[#172625]">
      <AppHeader
        globalStatus={globalStatus}
        language={language}
        mode={simulation.mode}
        t={t}
        onLanguageChange={setLanguage}
        onModeChange={simulation.changeMode}
        onRefresh={refreshWeather}
      />

      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <DashboardSummary
          dataStatus={dataStatus}
          lastUpdated={lastUpdated}
          mode={simulation.mode}
          statCards={statCards}
          t={t}
        />

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
            <FloodRiskMap
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
            mode={simulation.mode}
            running={simulation.simulationRunning}
            rainfall={simulation.simulationRainfall}
            river={simulation.simulationRiver}
            t={t}
            onRainfall={simulation.setSimulationRainfall}
            onRiver={simulation.setSimulationRiver}
            onStart={simulation.startSimulation}
            onStop={simulation.stopSimulation}
            onReset={simulation.resetSimulation}
          />

          <AlertPanel
            alerts={alertLog}
            selectedDistrict={selectedDistrict}
            t={t}
          />
        </section>

        <section className="grid min-w-0 gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <AdminPanel t={t} />
          <IntegrationPanel />
        </section>
      </div>
    </main>
  );
}
