export const dynamic = "force-dynamic";

function hasTwilioConfig() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM_NUMBER
  );
}

async function sendTwilioSms({ recipient, message }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  const body = new URLSearchParams({
    To: recipient,
    From: fromNumber,
    Body: message,
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Twilio ${response.status}`);
  }

  return response.json();
}

async function sendTwilioSmsWithRetry(payload) {
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await sendTwilioSms(payload);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

export async function POST(request) {
  const payload = await request.json();
  const recipients = Array.isArray(payload.recipients) ? payload.recipients : [];
  const message = [payload.messages?.english, payload.messages?.dzongkha]
    .filter(Boolean)
    .join("\n\n");
  const sentAt = new Date().toISOString();

  if (!hasTwilioConfig() || recipients.length === 0) {
    return Response.json({
      mode: "simulation",
      sentAt,
      deliveries: recipients.length,
      message: "Twilio credentials or recipients are not configured. Alert shown on screen.",
    });
  }

  const deliveries = await Promise.all(
    recipients.map((recipient) => sendTwilioSmsWithRetry({ recipient, message }))
  );

  return Response.json({
    mode: "twilio",
    sentAt,
    deliveries: deliveries.length,
  });
}
