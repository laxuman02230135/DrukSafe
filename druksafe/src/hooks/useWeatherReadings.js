"use client";

import { useCallback, useEffect, useState } from "react";
import {
  REFRESH_INTERVAL_MS,
  buildFallbackReadings,
} from "@/lib/druksafe-data";

const CACHE_KEY = "druksafe.latestReadings";

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

export function useWeatherReadings() {
  const [liveReadings, setLiveReadings] = useState(buildFallbackReadings);
  const [dataStatus, setDataStatus] = useState({
    source: "Baseline",
    stale: true,
    loading: true,
    message: "Loading Open-Meteo forecast and flood data",
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadWeather = useCallback(async () => {
    setDataStatus((current) => ({
      ...current,
      loading: true,
      message: "Refreshing Open-Meteo forecast and flood data",
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
        message: payload.message ?? "Live forecast active",
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

  return {
    dataStatus,
    lastUpdated,
    liveReadings,
    refreshWeather: loadWeather,
  };
}
