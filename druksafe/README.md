# DrukSafe

AI-powered flood prediction and early warning dashboard for Bhutan.

## Prototype Scope

- Monitors the four v1 target dzongkhags: Punakha, Wangdue Phodrang, Sarpang, and Samtse.
- Fetches no-key rainfall forecast data through Open-Meteo's Forecast API.
- Fetches no-key GloFAS river discharge forecasts through Open-Meteo's Flood API.
- Combines river discharge and rainfall into a district risk score from 0-100.
- Shows a colour-coded dashboard map, district detail panel, rainfall trend chart, and global status.
- Includes a clearly labelled simulation mode with rainfall and river controls.
- Generates bilingual English and Dzongkha SMS alert previews when risk crosses 70/100.
- Keeps Twilio keys server-side in `src/app/api/alerts/route.js`; without credentials it uses an on-screen simulation fallback.

## Commands

```bash
npm run dev
npm run lint
npm run build
```

Open `http://localhost:3000` after starting the development server.

## Production Notes

The current app is a hackathon-ready prototype. For production, add encrypted recipient storage, a real SQLite or managed database adapter, authenticated admin routes, real Bhutan district GeoJSON with Leaflet, and verified Twilio recipient lists from DDM/NCHM.
