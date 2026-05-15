"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createSimulationReadings } from "@/lib/druksafe-data";

export function useSimulationControls() {
  const [mode, setMode] = useState("live");
  const [simulationRainfall, setSimulationRainfall] = useState(72);
  const [simulationRiver, setSimulationRiver] = useState(24);
  const [simulationRunning, setSimulationRunning] = useState(false);

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

  const changeMode = useCallback((nextMode) => {
    setMode(nextMode);
    setSimulationRunning(nextMode === "simulation");
  }, []);

  const startSimulation = useCallback(() => {
    setMode("simulation");
    setSimulationRunning(true);
  }, []);

  const stopSimulation = useCallback(() => {
    setSimulationRunning(false);
  }, []);

  const resetSimulation = useCallback(() => {
    setSimulationRainfall(72);
    setSimulationRiver(24);
    setSimulationRunning(false);
  }, []);

  return {
    changeMode,
    mode,
    resetSimulation,
    setSimulationRainfall,
    setSimulationRiver,
    simulationRainfall,
    simulationReadings,
    simulationRiver,
    simulationRunning,
    startSimulation,
    stopSimulation,
  };
}
