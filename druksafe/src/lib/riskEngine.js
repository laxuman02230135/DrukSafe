import { DISTRICTS } from "@/data/districts";

export const REFRESH_INTERVAL_MS = 15 * 60 * 1000;
export const ALERT_COOLDOWN_MS = 15 * 60 * 1000;
export const HIGH_RISK_THRESHOLD = 70;
export const MEDIUM_RISK_THRESHOLD = 40;

export const RISK_WEIGHTS = {
  rainfallIntensity: 0.46,
  riverRise: 0.34,
  districtVulnerability: 0.2,
};

const RISK_LEVELS = {
  LOW: {
    key: "low",
    copyKey: "allClear",
    label: "LOW",
    status: "ALL CLEAR",
    color: "#16d49a",
    soft: "rgba(22, 212, 154, 0.16)",
    text: "#b8ffe8",
  },
  MEDIUM: {
    key: "medium",
    copyKey: "advisory",
    label: "MEDIUM",
    status: "ADVISORY",
    color: "#ffb84d",
    soft: "rgba(255, 184, 77, 0.18)",
    text: "#ffe1a8",
  },
  HIGH: {
    key: "high",
    copyKey: "alertActive",
    label: "HIGH",
    status: "ALERT ACTIVE",
    color: "#ff4d5e",
    soft: "rgba(255, 77, 94, 0.2)",
    text: "#ffd0d6",
  },
};

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalize(value, max) {
  return clamp((toFiniteNumber(value) / max) * 100, 0, 100);
}

export function estimateRiverRise(rainfall, district) {
  const baseRise = toFiniteNumber(district?.riverRise, 10) * 0.42;
  const rainfallPressure = toFiniteNumber(rainfall) * toFiniteNumber(district?.sensitivity, 1) * 0.42;

  return Math.round(clamp(baseRise + rainfallPressure, 3, 75));
}

export function calculateRiskScore({ rainfall, riverRise, vulnerability }) {
  const rainfallComponent = normalize(rainfall, 120) * RISK_WEIGHTS.rainfallIntensity;
  const riverComponent = normalize(riverRise, 55) * RISK_WEIGHTS.riverRise;
  const vulnerabilityComponent =
    normalize(toFiniteNumber(vulnerability, 0.7), 1) *
    RISK_WEIGHTS.districtVulnerability;
  const compoundingBoost =
    (toFiniteNumber(rainfall) > 90 ? 4 : 0) +
    (toFiniteNumber(riverRise) > 38 ? 4 : 0) +
    (toFiniteNumber(rainfall) > 105 && toFiniteNumber(riverRise) > 45 ? 6 : 0);

  return Math.round(
    clamp(
      rainfallComponent + riverComponent + vulnerabilityComponent + compoundingBoost,
      0,
      100
    )
  );
}

export function classifyRisk(score) {
  const normalizedScore = toFiniteNumber(score);

  if (normalizedScore > HIGH_RISK_THRESHOLD) {
    return "HIGH";
  }

  if (normalizedScore >= MEDIUM_RISK_THRESHOLD) {
    return "MEDIUM";
  }

  return "LOW";
}

export function getRiskLevel(score) {
  return RISK_LEVELS[classifyRisk(score)];
}

export function buildFallbackReadings() {
  return Object.fromEntries(
    DISTRICTS.map((district) => [
      district.id,
      {
        rainfall: district.rainfall,
        riverRise: district.riverRise,
        history: district.history,
        currentRainfall: null,
        floodSource: "Prototype baseline",
        peakDischarge: null,
        precipitationProbability: null,
        riverDischarge: null,
        updatedAt: null,
      },
    ])
  );
}

export function buildRiskPayload(district, reading = {}) {
  const rainfall = Math.round(toFiniteNumber(reading.rainfall, district.rainfall));
  const riverRise = Math.round(
    toFiniteNumber(reading.riverRise, estimateRiverRise(rainfall, district))
  );
  const riskScore = calculateRiskScore({
    rainfall,
    riverRise,
    vulnerability: district.vulnerability,
  });
  const level = classifyRisk(riskScore);

  return {
    district: district.name,
    districtId: district.id,
    river: district.river,
    rainfall,
    riverRise,
    riskScore,
    level,
  };
}

export function enrichDistricts(readings = {}) {
  return DISTRICTS.map((district) => {
    const current = readings[district.id] ?? {};
    const risk = buildRiskPayload(district, current);
    const level = getRiskLevel(risk.riskScore);

    return {
      ...district,
      ...current,
      ...risk,
      score: risk.riskScore,
      level,
      levelName: risk.level,
      history: current.history?.length ? current.history : district.history,
      currentRainfall: current.currentRainfall ?? null,
      floodSource: current.floodSource ?? "Estimated",
      peakDischarge: current.peakDischarge ?? null,
      precipitationProbability: current.precipitationProbability ?? null,
      riverDischarge: current.riverDischarge ?? null,
      updatedAt: current.updatedAt ?? null,
    };
  });
}

export function getGlobalStatus(districts) {
  if (districts.some((district) => district.riskScore > HIGH_RISK_THRESHOLD)) {
    return RISK_LEVELS.HIGH;
  }

  if (districts.some((district) => district.riskScore >= MEDIUM_RISK_THRESHOLD)) {
    return RISK_LEVELS.MEDIUM;
  }

  return RISK_LEVELS.LOW;
}

export function createSimulationReadings(rainfallInput, riverInput) {
  return Object.fromEntries(
    DISTRICTS.map((district, index) => {
      const rainFactor = 0.52 + index * 0.08;
      const riverFactor = 0.46 + index * 0.07;
      const rainfall = clamp(
        district.rainfall * 0.36 + toFiniteNumber(rainfallInput) * rainFactor,
        0,
        160
      );
      const riverRise = clamp(
        district.riverRise * 0.48 + toFiniteNumber(riverInput) * riverFactor,
        0,
        80
      );
      const history = district.history.map((value, point) =>
        Math.round(clamp(value * 0.45 + rainfall * (0.26 + point * 0.025), 0, 170))
      );

      return [
        district.id,
        {
          rainfall,
          riverRise,
          history,
          currentRainfall: null,
          floodSource: "Manual simulation",
          peakDischarge: null,
          precipitationProbability: null,
          riverDischarge: null,
          updatedAt: new Date().toISOString(),
        },
      ];
    })
  );
}
