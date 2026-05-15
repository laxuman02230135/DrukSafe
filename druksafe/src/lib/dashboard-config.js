export const RECIPIENT_GROUPS = [
  "Farmers",
  "Gups",
  "Dzongkhag disaster officers",
  "NCHM observers",
];

export const INTEGRATIONS = [
  { name: "Open-Meteo Forecast", status: "Live rainfall API", tone: "ready" },
  { name: "Open-Meteo Flood", status: "GloFAS river discharge", tone: "ready" },
  { name: "Leaflet.js", status: "Interactive risk markers", tone: "ready" },
  { name: "AI risk engine", status: "Weighted scoring API", tone: "ready" },
  { name: "SMS", status: "Twilio or simulated dispatch", tone: "watch" },
  { name: "Storage", status: "Browser cache prototype", tone: "watch" },
];
