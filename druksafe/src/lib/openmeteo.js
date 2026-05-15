import { DISTRICTS, getDistrictById } from "@/data/districts";
import {
  REFRESH_INTERVAL_MS,
  buildFallbackReadings,
  estimateRiverRise,
} from "@/lib/riskEngine";

const WEATHER_API_URL =
  process.env.OPEN_METEO_FORECAST_URL ?? "https://api.open-meteo.com/v1/forecast";
const FLOOD_API_URL =
  process.env.OPEN_METEO_FLOOD_URL ?? "https://flood-api.open-meteo.com/v1/flood";
const REQUEST_TIMEOUT_MS = Number(process.env.OPEN_METEO_TIMEOUT_MS ?? 8000);
const FLOOD_PAST_DAYS = 7;
const cache = new Map();

function numericValues(values) {
  return Array.isArray(values)
    ? values.map(Number).filter((value) => Number.isFinite(value))
    : [];
}

function roundOne(value) {
  return Number.isFinite(value) ? Math.round(value * 10) / 10 : null;
}

function chunkTotals(values, chunkSize) {
  const chunks = [];

  for (let index = 0; index < values.length; index += chunkSize) {
    const total = values
      .slice(index, index + chunkSize)
      .reduce((sum, value) => sum + value, 0);
    chunks.push(Math.round(total));
  }

  return chunks;
}

async function fetchJsonWithRetry(url, sourceName, attempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        cache: "no-store",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`${sourceName} ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError;
}

function buildWeatherUrl(district) {
  const params = new URLSearchParams({
    latitude: String(district.latitude),
    longitude: String(district.longitude),
    current: "precipitation,rain,showers",
    hourly: "precipitation,precipitation_probability,rain,showers",
    forecast_days: "3",
    timezone: "Asia/Thimphu",
  });

  return `${WEATHER_API_URL}?${params.toString()}`;
}

function buildFloodUrl(district) {
  const params = new URLSearchParams({
    latitude: String(district.latitude),
    longitude: String(district.longitude),
    daily: "river_discharge",
    past_days: String(FLOOD_PAST_DAYS),
    forecast_days: "7",
    cell_selection: "nearest",
  });

  return `${FLOOD_API_URL}?${params.toString()}`;
}

function summarizeWeather(payload) {
  const precipitation = numericValues(payload.hourly?.precipitation);
  const probabilities = numericValues(payload.hourly?.precipitation_probability);
  const next24Hours = precipitation.slice(0, 24);
  const history = chunkTotals(precipitation.slice(0, 72), 6).slice(0, 12);
  const rainfall = next24Hours.reduce((total, value) => total + value, 0);
  const precipitationProbability = probabilities.length
    ? Math.round(Math.max(...probabilities.slice(0, 24)))
    : null;

  return {
    currentRainfall: roundOne(payload.current?.precipitation),
    history: history.length ? history : [0],
    precipitationProbability,
    rainfall: Math.round(rainfall),
  };
}

function summarizeFlood(payload, district, rainfall) {
  const discharge = numericValues(payload?.daily?.river_discharge);

  if (!discharge.length) {
    return {
      peakDischarge: null,
      riverDischarge: null,
      riverRise: estimateRiverRise(rainfall, district),
    };
  }

  const todayIndex = Math.min(FLOOD_PAST_DAYS, discharge.length - 1);
  const recentDischarge = discharge.slice(0, todayIndex);
  const forecastDischarge = discharge.slice(todayIndex);
  const currentDischarge = discharge[todayIndex] ?? discharge[discharge.length - 1];
  const peakDischarge = Math.max(...(forecastDischarge.length ? forecastDischarge : discharge));
  const baseline =
    recentDischarge.reduce((total, value) => total + value, 0) /
      Math.max(1, recentDischarge.length) || currentDischarge;
  const rawRise = baseline > 0 ? ((peakDischarge - baseline) / baseline) * 100 : 0;

  return {
    peakDischarge: roundOne(peakDischarge),
    riverDischarge: roundOne(currentDischarge),
    riverRise: Math.round(Math.min(75, Math.max(3, rawRise))),
  };
}

async function fetchRemoteDistrictForecast(district) {
  const [weatherPayload, floodResult] = await Promise.all([
    fetchJsonWithRetry(buildWeatherUrl(district), "Open-Meteo forecast"),
    fetchJsonWithRetry(buildFloodUrl(district), "Open-Meteo flood").then(
      (payload) => ({ payload }),
      (error) => ({ error })
    ),
  ]);
  const weather = summarizeWeather(weatherPayload);
  const flood = floodResult.payload
    ? summarizeFlood(floodResult.payload, district, weather.rainfall)
    : summarizeFlood(null, district, weather.rainfall);

  return {
    ...weather,
    ...flood,
    floodSource: floodResult.payload ? "Open-Meteo GloFAS" : "Estimated from rainfall",
    stale: false,
    updatedAt: new Date().toISOString(),
  };
}

export async function getDistrictForecast(district, { forceRefresh = false } = {}) {
  const cached = cache.get(district.id);
  const cacheFresh = cached && Date.now() - cached.cachedAt < REFRESH_INTERVAL_MS;

  if (!forceRefresh && cacheFresh) {
    return cached.value;
  }

  try {
    const value = await fetchRemoteDistrictForecast(district);
    cache.set(district.id, { cachedAt: Date.now(), value });
    return value;
  } catch (error) {
    if (cached?.value) {
      return {
        ...cached.value,
        stale: true,
        message: error instanceof Error ? error.message : "Open-Meteo unavailable",
      };
    }

    const fallback = buildFallbackReadings()[district.id];
    return {
      ...fallback,
      stale: true,
      updatedAt: new Date().toISOString(),
      message: error instanceof Error ? error.message : "Open-Meteo unavailable",
    };
  }
}

export async function getForecastsForDistricts({
  districtIds,
  forceRefresh = false,
} = {}) {
  const selectedDistricts = districtIds?.length
    ? districtIds.map((id) => getDistrictById(id)).filter(Boolean)
    : DISTRICTS;

  const entries = await Promise.all(
    selectedDistricts.map(async (district) => [
      district.id,
      await getDistrictForecast(district, { forceRefresh }),
    ])
  );
  const readings = Object.fromEntries(entries);
  const stale = Object.values(readings).some((reading) => reading.stale);

  return {
    source: "Open-Meteo Forecast + Open-Meteo GloFAS Flood",
    stale,
    updatedAt: new Date().toISOString(),
    refreshIntervalMs: REFRESH_INTERVAL_MS,
    readings,
  };
}
