import { getForecastsForDistricts } from "@/lib/openmeteo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const forecast = await getForecastsForDistricts();

    return Response.json({
      source: forecast.source,
      stale: forecast.stale,
      updatedAt: forecast.updatedAt,
      refreshIntervalMs: forecast.refreshIntervalMs,
      readings: forecast.readings,
    });
  } catch (error) {
    return Response.json(
      {
        source: "Open-Meteo Forecast + Open-Meteo GloFAS Flood",
        stale: true,
        updatedAt: new Date().toISOString(),
        message: error instanceof Error ? error.message : "Live data unavailable",
      },
      { status: 503 }
    );
  }
}
