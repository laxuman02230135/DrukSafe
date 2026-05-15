import twilio from "twilio";
import { ALERT_RECIPIENTS, DEFAULT_ALERT_PHONE } from "@/data/districts";
import { ALERT_COOLDOWN_MS, HIGH_RISK_THRESHOLD } from "@/lib/riskEngine";
import { TRANSLATIONS } from "@/lib/translations";

const dispatchLedger = new Map();

export function normalizePhoneNumber(phoneNumber) {
  const rawValue = String(phoneNumber ?? "").trim();

  if (rawValue.startsWith("+")) {
    return rawValue;
  }

  const digits = rawValue.replace(/\D/g, "");

  if (digits.length === 8) {
    return `+975${digits}`;
  }

  if (digits.startsWith("975")) {
    return `+${digits}`;
  }

  return digits ? `+${digits}` : "";
}

export function getAlertRecipients(recipients) {
  const configured = process.env.ALERT_PHONE_NUMBER || DEFAULT_ALERT_PHONE;
  const requested = Array.isArray(recipients) && recipients.length
    ? recipients
    : [configured, ...ALERT_RECIPIENTS.map((recipient) => recipient.phone)];
  const normalized = requested.map(normalizePhoneNumber).filter(Boolean);

  return [...new Set(normalized)];
}

export function hasTwilioConfig() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      (process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM_NUMBER)
  );
}

export function buildSmsTemplates({ district, riskScore, rainfall, riverRise }) {
  const englishAction = TRANSLATIONS.en.action;
  const dzongkhaAction = TRANSLATIONS.dz.action;

  return {
    english: `Flood alert for ${district.name}: risk ${riskScore}/100, rainfall ${rainfall} mm, river rise ${riverRise}%. ${englishAction}`,
    dzongkha: `${district.dzongkha}: ཆུ་ལོག་ཉེན་བརྡ། ཉེན་སྐུགས་ ${riskScore}/100, ཆརཔ་ ${rainfall} mm, ཆུ་ཚད་ ${riverRise}%. ${dzongkhaAction}`,
  };
}

function getLedgerKey(districtId, recipient) {
  return `${districtId}:${recipient}`;
}

function checkRateLimit(districtId, recipient) {
  const key = getLedgerKey(districtId, recipient);
  const previousDispatch = dispatchLedger.get(key) ?? 0;
  const elapsed = Date.now() - previousDispatch;

  if (elapsed < ALERT_COOLDOWN_MS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((ALERT_COOLDOWN_MS - elapsed) / 1000),
    };
  }

  dispatchLedger.set(key, Date.now());
  return { allowed: true, retryAfterSeconds: 0 };
}

async function sendTwilioMessage({ body, recipient }) {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const from = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM_NUMBER;

  return client.messages.create({
    body,
    from,
    to: recipient,
  });
}

export async function sendBilingualFloodAlert({
  district,
  rainfall,
  recipients,
  riskScore,
  riverRise,
}) {
  if (Number(riskScore) <= HIGH_RISK_THRESHOLD) {
    return {
      mode: "skipped",
      deliveries: [],
      reason: `Risk score must be greater than ${HIGH_RISK_THRESHOLD}`,
    };
  }

  const targets = getAlertRecipients(recipients);
  const messages = buildSmsTemplates({ district, riskScore, rainfall, riverRise });
  const body = `${messages.english}\n\n${messages.dzongkha}`;
  const twilioConfigured = hasTwilioConfig();
  const sentAt = new Date().toISOString();
  const deliveries = [];

  for (const recipient of targets) {
    const rateLimit = checkRateLimit(district.id, recipient);

    if (!rateLimit.allowed) {
      deliveries.push({
        recipient,
        status: "rate_limited",
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      });
      continue;
    }

    if (!twilioConfigured) {
      console.info("[druksafe-alerts] simulated SMS", {
        district: district.id,
        recipient,
        riskScore,
      });
      deliveries.push({ recipient, status: "simulated" });
      continue;
    }

    try {
      const message = await sendTwilioMessage({ body, recipient });
      console.info("[druksafe-alerts] Twilio SMS sent", {
        district: district.id,
        recipient,
        sid: message.sid,
      });
      deliveries.push({ recipient, status: "sent", sid: message.sid });
    } catch (error) {
      console.error("[druksafe-alerts] Twilio SMS failed", {
        district: district.id,
        recipient,
        error: error instanceof Error ? error.message : error,
      });
      deliveries.push({
        recipient,
        status: "failed",
        error: error instanceof Error ? error.message : "Twilio send failed",
      });
    }
  }

  return {
    mode: twilioConfigured ? "twilio" : "simulation",
    sentAt,
    messages,
    deliveries,
  };
}
