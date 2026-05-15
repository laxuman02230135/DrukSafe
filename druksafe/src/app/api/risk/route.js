import { DISTRICTS, getDistrictById } from "@/data/districts";
import { getForecastsForDistricts } from "@/lib/openmeteo";
import {
  HIGH_RISK_THRESHOLD,
  buildRiskPayload,
  calculateRiskScore,
  classifyRisk,
  estimateRiverRise,
  toFiniteNumber,
} from "@/lib/riskEngine";

export const dynamic = "force-dynamic";

function serializeRisk(district, reading = {}) {
  const risk = buildRiskPayload(district, reading);

  return {
    ...risk,
    threshold: HIGH_RISK_THRESHOLD,
    shouldAlert: risk.riskScore > HIGH_RISK_THRESHOLD,
    updatedAt: reading.updatedAt ?? new Date().toISOString(),
    source: reading.floodSource ?? "Estimated",
  };
}

function validationError(message, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const districtId = searchParams.get("district");
  const forceRefresh = searchParams.get("refresh") === "true";

  if (districtId && !getDistrictById(districtId)) {
    return validationError(`Unsupported district: ${districtId}`, 404);
  }

  try {
    const forecast = await getForecastsForDistricts({
      districtIds: districtId ? [districtId] : undefined,
      forceRefresh,
    });
    const results = (districtId ? [getDistrictById(districtId)] : DISTRICTS).map(
      (district) => serializeRisk(district, forecast.readings[district.id])
    );

    if (districtId) {
      return Response.json(results[0]);
    }

    return Response.json({
      source: forecast.source,
      stale: forecast.stale,
      updatedAt: forecast.updatedAt,
      refreshIntervalMs: forecast.refreshIntervalMs,
      results,
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Risk engine unavailable",
      },
      { status: 503 }
    );
  }
}

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return validationError("Invalid JSON payload");
  }

  const district = getDistrictById(payload.districtId ?? payload.district);

  if (!district) {
    return validationError("districtId is required and must be a supported Bhutan district");
  }

  const rainfall = toFiniteNumber(payload.rainfall, NaN);

  if (!Number.isFinite(rainfall) || rainfall < 0) {
    return validationError("rainfall must be a non-negative number");
  }

  const riverRise =
    payload.riverRise === undefined
      ? estimateRiverRise(rainfall, district)
      : toFiniteNumber(payload.riverRise, NaN);

  if (!Number.isFinite(riverRise) || riverRise < 0) {
    return validationError("riverRise must be a non-negative number");
  }

  const riskScore = calculateRiskScore({
    rainfall,
    riverRise,
    vulnerability: district.vulnerability,
  });

  return Response.json({
    district: district.name,
    districtId: district.id,
    river: district.river,
    rainfall: Math.round(rainfall),
    riverRise: Math.round(riverRise),
    riskScore,
    level: classifyRisk(riskScore),
    threshold: HIGH_RISK_THRESHOLD,
    shouldAlert: riskScore > HIGH_RISK_THRESHOLD,
  });
}
