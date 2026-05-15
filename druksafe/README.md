# DrukSafe

AI-powered flood prediction and early warning dashboard for Bhutan.

## Prototype Scope

- Monitors the four v1 target dzongkhags: Punakha, Sarpang, Samtse, and Zhemgang.
- Fetches no-key rainfall forecast data through Open-Meteo's Forecast API.
- Fetches no-key GloFAS river discharge forecasts through Open-Meteo's Flood API.
- Combines river discharge and rainfall into a district risk score from 0-100.
- Shows a Leaflet.js risk map, district cards, Chart.js rainfall trends, animated risk bars, and a bilingual header toggle.
- Includes live Open-Meteo values plus manual simulation sliders. Moving a slider enters simulation mode.
- Sends or simulates bilingual English and Dzongkha SMS alerts when a river risk score is greater than 70/100.
- Keeps Twilio keys server-side in `src/lib/twilio.js` and `src/app/api/alerts/route.js`.

## Environment

Use `env.local.example` as the sample for `.env.local` and fill the Twilio sender values when you want real SMS delivery.

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
ALERT_PHONE_NUMBER=77459910
```

Without Twilio credentials, alerts are logged and returned as simulated dispatches so the prototype remains usable.

## Commands

```bash
npm run dev
npm run lint
npm run build
```

Open `http://localhost:3000` after starting the development server.

## API Samples

`GET /api/risk?district=punakha`

```json
{
  "district": "Punakha",
  "districtId": "punakha",
  "river": "Pho Chhu",
  "rainfall": 92,
  "riverRise": 34,
  "riskScore": 77,
  "level": "HIGH",
  "threshold": 70,
  "shouldAlert": true
}
```

`POST /api/alerts`

```json
{
  "districtId": "punakha",
  "rainfall": 92,
  "riverRise": 34,
  "riskScore": 77,
  "recipients": ["77459910"]
}
```

Response without Twilio credentials:

```json
{
  "district": "Punakha",
  "threshold": 70,
  "twilioConfigured": false,
  "mode": "simulation",
  "deliveries": [{ "recipient": "+97577459910", "status": "simulated" }]
}
```

## Production Notes

The current app is a hackathon-ready prototype. For production, add encrypted recipient storage, a real database adapter, authenticated admin routes, verified Bhutan district GeoJSON, and approved Twilio recipient lists from DDM/NCHM.
