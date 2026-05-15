import {
  DISTRICTS,
  estimateRiverRise,
} from "@/lib/druksafe-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const entries = await Promise.all(
      DISTRICTS.map(async (district) => {
        const params = new URLSearchParams({
          latitude: String(district.latitude),
          longitude: String(district.longitude),
          hourly: "precipitation",
          forecast_hours: "8",
          timezone: "Asia/Thimphu",
        });

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error(`Open-Meteo ${response.status}`);
        }

        const payload = await response.json();
        const precipitation = payload.hourly?.precipitation ?? [];
        const history = precipitation
          .slice(0, 8)
          .map((value) => Math.round(Number(value || 0)));
        const rainfall = history.reduce((total, value) => total + value, 0);
        const riverRise = estimateRiverRise(rainfall, district);

        return [
          district.id,
          {
            rainfall,
            riverRise,
            history,
            updatedAt: new Date().toISOString(),
          },
        ];
      })
    );

    return Response.json({
      source: "Open-Meteo",
      stale: false,
      updatedAt: new Date().toISOString(),
      readings: Object.fromEntries(entries),
    });
  } catch (error) {
    return Response.json(
      {
        source: "Open-Meteo",
        stale: true,
        updatedAt: new Date().toISOString(),
        message: error instanceof Error ? error.message : "Live data unavailable",
      },
      { status: 503 }
    );
  }
}
