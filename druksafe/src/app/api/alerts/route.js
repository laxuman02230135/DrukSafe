import { getDistrictById, getDistrictByName } from "@/data/districts";
import { HIGH_RISK_THRESHOLD } from "@/lib/riskEngine";
import { hasTwilioConfig, sendBilingualFloodAlert } from "@/lib/twilio";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const district =
    getDistrictById(payload.districtId) ?? getDistrictByName(payload.district);
  const riskScore = Number(payload.riskScore ?? payload.score);
  const rainfall = Number(payload.rainfall);
  const riverRise = Number(payload.riverRise);

  if (!district) {
    return Response.json(
      { error: "A supported districtId or district name is required" },
      { status: 400 }
    );
  }

  if (!Number.isFinite(riskScore)) {
    return Response.json({ error: "riskScore is required" }, { status: 400 });
  }

  if (!Number.isFinite(rainfall) || !Number.isFinite(riverRise)) {
    return Response.json(
      { error: "rainfall and riverRise are required" },
      { status: 400 }
    );
  }

  if (riskScore <= HIGH_RISK_THRESHOLD) {
    return Response.json({
      mode: "skipped",
      threshold: HIGH_RISK_THRESHOLD,
      message: `Risk score must be greater than ${HIGH_RISK_THRESHOLD}`,
    });
  }

  const result = await sendBilingualFloodAlert({
    district,
    rainfall: Math.round(rainfall),
    recipients: payload.recipients,
    riskScore: Math.round(riskScore),
    riverRise: Math.round(riverRise),
  });

  return Response.json({
    district: district.name,
    threshold: HIGH_RISK_THRESHOLD,
    twilioConfigured: hasTwilioConfig(),
    ...result,
  });
}

export async function GET() {
  return Response.json({
    threshold: HIGH_RISK_THRESHOLD,
    twilioConfigured: hasTwilioConfig(),
    recipientMode: "prototype-single-number",
    target: process.env.ALERT_PHONE_NUMBER ?? "77459910",
  });
}
