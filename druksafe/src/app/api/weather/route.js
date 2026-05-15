import {
  clamp,
  DISTRICTS,
  estimateRiverRise,
} from "@/lib/druksafe-data";

export const dynamic = "force-dynamic";

const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";
const FLOOD_API_URL = "https://flood-api.open-meteo.com/v1/flood";
const SOURCE_LABEL = "Open-Meteo Forecast + GloFAS Flood";
const FLOOD_PAST_DAYS = 7;

function numericValues(values) {
  return Array.isArray(values)
    ? values.map(Number).filter((value) => Number.isFinite(value))
    : [];
}

function roundOne(value) {
  return Number.isFinite(value) ? Math.round(value * 10) / 10 : null;
}

async function fetchJson(url, sourceName) {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`${sourceName} ${response.status}`);
  }

  return response.json();
}

function buildWeatherUrl(district) {
  const params = new URLSearchParams({
    latitude: String(district.latitude),
    longitude: String(district.longitude),
    current: "precipitation,rain,showers",
    hourly: "precipitation,precipitation_probability",
    forecast_hours: "8",
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
  const history = precipitation.slice(0, 8).map((value) => Math.round(value));
  const rainfall = history.reduce((total, value) => total + value, 0);
  const precipitationProbability = probabilities.length
    ? Math.round(Math.max(...probabilities))
    : null;

  return {
    currentRainfall: roundOne(payload.current?.precipitation),
    history,
    precipitationProbability,
    rainfall,
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
    riverRise: Math.round(clamp(rawRise, 4, 68)),
  };
}

async function getDistrictReading(district) {
  const [weatherPayload, floodResult] = await Promise.all([
    fetchJson(buildWeatherUrl(district), "Open-Meteo forecast"),
    fetchJson(buildFloodUrl(district), "Open-Meteo flood").then(
      (payload) => ({ payload }),
      (error) => ({ error })
    ),
  ]);
  const weather = summarizeWeather(weatherPayload);
  const flood = floodResult.payload
    ? summarizeFlood(floodResult.payload, district, weather.rainfall)
    : summarizeFlood(null, district, weather.rainfall);

  return [
    district.id,
    {
      ...weather,
      ...flood,
      floodSource: floodResult.payload ? "GloFAS" : "Estimated",
      updatedAt: new Date().toISOString(),
    },
  ];
}

export async function GET() {
  try {
    const entries = await Promise.all(
      DISTRICTS.map((district) => getDistrictReading(district))
    );

    return Response.json({
      source: SOURCE_LABEL,
      stale: false,
      updatedAt: new Date().toISOString(),
      readings: Object.fromEntries(entries),
    });
  } catch (error) {
    return Response.json(
      {
        source: SOURCE_LABEL,
        stale: true,
        updatedAt: new Date().toISOString(),
        message: error instanceof Error ? error.message : "Live data unavailable",
      },
      { status: 503 }
    );
  }
}
