"use client"
import Link from "next/link";
import { useEffect, useRef } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --blue-dark: #0a1628;
    --blue-mid: #0d2244;
    --blue-accent: #1565c0;
    --blue-glow: #1e88e5;
    --teal: #00bfa5;
    --teal-light: #64ffda;
    --amber: #ffab00;
    --red-alert: #ef5350;
    --white: #f0f4ff;
    --muted: #8faac8;
    --card-bg: rgba(255,255,255,0.04);
    --card-border: rgba(255,255,255,0.08);
  }

  html { scroll-behavior: smooth; }

  .ds-body {
    background-color: var(--blue-dark);
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    overflow-x: hidden;
    min-height: 100vh;
    position: relative;
  }

  .ds-body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(21,101,192,0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(21,101,192,0.07) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
    z-index: 0;
  }

  /* NAV */
  .ds-nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.2rem 4rem;
    background: rgba(10, 22, 40, 0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--card-border);
  }

  .ds-nav-logo {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.4rem;
    letter-spacing: -0.02em;
    color: var(--white);
    text-decoration: none;
  }

  .ds-nav-logo span { color: var(--teal); }

  .ds-nav-links {
    display: flex;
    gap: 2.5rem;
    list-style: none;
  }

  .ds-nav-links a {
    color: var(--muted);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 400;
    letter-spacing: 0.02em;
    transition: color 0.2s;
  }

  .ds-nav-links a:hover { color: var(--white); }

  .ds-nav-cta {
    background: var(--teal) !important;
    color: var(--blue-dark) !important;
    font-weight: 500 !important;
    padding: 0.55rem 1.4rem;
    border-radius: 6px;
    transition: opacity 0.2s !important;
  }

  .ds-nav-cta:hover { opacity: 0.85; }

  /* HERO */
  .ds-hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 8rem 2rem 5rem;
    z-index: 1;
  }

  .ds-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(0,191,165,0.1);
    border: 1px solid rgba(0,191,165,0.3);
    color: var(--teal-light);
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.4rem 1.1rem;
    border-radius: 100px;
    margin-bottom: 2rem;
    animation: dsfadeUp 0.6s ease both;
  }

  .ds-badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--teal);
    animation: dspulse 2s infinite;
  }

  @keyframes dspulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }

  .ds-hero h1 {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: clamp(2.8rem, 6vw, 5.5rem);
    line-height: 1.05;
    letter-spacing: -0.03em;
    max-width: 900px;
    animation: dsfadeUp 0.6s 0.1s ease both;
  }

  .ds-accent { color: var(--teal); }
  .ds-accent-amber { color: var(--amber); }

  .ds-hero-sub {
    margin-top: 1.5rem;
    font-size: 1.1rem;
    color: var(--muted);
    line-height: 1.7;
    max-width: 580px;
    font-weight: 300;
    animation: dsfadeUp 0.6s 0.2s ease both;
  }

  .ds-hero-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2.5rem;
    flex-wrap: wrap;
    justify-content: center;
    animation: dsfadeUp 0.6s 0.3s ease both;
  }

  .ds-btn-primary {
    background: var(--teal);
    color: var(--blue-dark);
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    font-size: 0.95rem;
    padding: 0.85rem 2rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    text-decoration: none;
    transition: transform 0.15s, opacity 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .ds-btn-primary:hover { transform: translateY(-2px); opacity: 0.9; }

  .ds-btn-secondary {
    background: transparent;
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-weight: 400;
    font-size: 0.95rem;
    padding: 0.85rem 2rem;
    border-radius: 8px;
    border: 1px solid var(--card-border);
    cursor: pointer;
    text-decoration: none;
    transition: border-color 0.2s, background 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .ds-btn-secondary:hover {
    border-color: rgba(255,255,255,0.25);
    background: rgba(255,255,255,0.04);
  }

  /* TICKER */
  .ds-ticker-bar {
    width: 100%;
    background: rgba(21, 101, 192, 0.15);
    border-top: 1px solid rgba(21,101,192,0.2);
    border-bottom: 1px solid rgba(21,101,192,0.2);
    padding: 0.7rem 0;
    overflow: hidden;
    position: relative;
    z-index: 1;
  }

  .ds-ticker-inner {
    display: flex;
    gap: 4rem;
    animation: dsticker 30s linear infinite;
    white-space: nowrap;
    width: max-content;
  }

  .ds-ticker-item {
    font-size: 0.8rem;
    letter-spacing: 0.05em;
    color: var(--muted);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .ds-status-dot { width: 5px; height: 5px; border-radius: 50%; display: inline-block; }
  .ds-dot-green { background: #69f0ae; }
  .ds-dot-amber { background: var(--amber); }
  .ds-dot-red { background: var(--red-alert); }

  @keyframes dsticker {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  /* STATS */
  .ds-stats {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: center;
    padding: 4rem 2rem;
    max-width: 900px;
    margin: 0 auto;
  }

  .ds-stat-item {
    flex: 1;
    text-align: center;
    padding: 0 2rem;
    border-right: 1px solid var(--card-border);
    animation: dsfadeUp 0.5s ease both;
  }

  .ds-stat-item:last-child { border-right: none; }

  .ds-stat-num {
    font-family: 'Syne', sans-serif;
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--white);
    line-height: 1;
  }

  .ds-stat-num span { color: var(--teal); }
  .ds-stat-label { font-size: 0.82rem; color: var(--muted); margin-top: 0.4rem; letter-spacing: 0.03em; }

  /* SECTION */
  .ds-section {
    position: relative;
    z-index: 1;
    padding: 5rem 2rem;
    max-width: 1100px;
    margin: 0 auto;
  }

  .ds-section-label {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--teal);
    margin-bottom: 0.8rem;
  }

  .ds-section-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.8rem, 3.5vw, 2.8rem);
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.02em;
    color: var(--white);
    max-width: 560px;
  }

  .ds-section-sub {
    font-size: 1rem;
    color: var(--muted);
    line-height: 1.7;
    max-width: 500px;
    margin-top: 1rem;
  }

  /* FEATURES GRID */
  .ds-features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5px;
    background: var(--card-border);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    overflow: hidden;
    margin-top: 3.5rem;
  }

  .ds-feature-card {
    background: var(--blue-dark);
    padding: 2rem 2rem 2.5rem;
    transition: background 0.3s;
    position: relative;
    overflow: hidden;
  }

  .ds-feature-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--teal), transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }

  .ds-feature-card:hover { background: rgba(255,255,255,0.03); }
  .ds-feature-card:hover::before { opacity: 1; }

  .ds-feature-icon {
    width: 42px; height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    margin-bottom: 1.2rem;
  }

  .ds-icon-teal { background: rgba(0,191,165,0.12); }
  .ds-icon-amber { background: rgba(255,171,0,0.12); }
  .ds-icon-red { background: rgba(239,83,80,0.12); }
  .ds-icon-blue { background: rgba(30,136,229,0.12); }

  .ds-feature-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.05rem;
    font-weight: 700;
    margin-bottom: 0.6rem;
    color: var(--white);
  }

  .ds-feature-desc { font-size: 0.88rem; color: var(--muted); line-height: 1.65; }

  /* HOW IT WORKS */
  .ds-how-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5rem;
    align-items: center;
    padding: 5rem 2rem;
    max-width: 1100px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  .ds-steps-list { margin-top: 2.5rem; }

  .ds-step {
    display: flex;
    gap: 1.2rem;
    padding: 1.4rem 0;
    border-bottom: 1px solid var(--card-border);
  }

  .ds-step:last-child { border-bottom: none; }

  .ds-step-num {
    font-family: 'Syne', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--teal);
    letter-spacing: 0.05em;
    width: 28px;
    flex-shrink: 0;
    padding-top: 2px;
  }

  .ds-step-content h4 {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--white);
    margin-bottom: 0.3rem;
  }

  .ds-step-content p { font-size: 0.85rem; color: var(--muted); line-height: 1.6; }

  /* DASHBOARD PREVIEW */
  .ds-dashboard-preview {
    background: var(--blue-mid);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    overflow: hidden;
  }

  .ds-dash-titlebar {
    background: rgba(255,255,255,0.04);
    padding: 0.7rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-bottom: 1px solid var(--card-border);
  }

  .ds-dash-dot { width: 10px; height: 10px; border-radius: 50%; }
  .ds-dash-body { padding: 1.2rem; }

  .ds-district-row {
    display: grid;
    grid-template-columns: 1fr auto auto auto;
    align-items: center;
    padding: 0.65rem 0.8rem;
    border-radius: 8px;
    margin-bottom: 0.5rem;
    font-size: 0.82rem;
    gap: 1rem;
  }

  .ds-district-name { font-weight: 500; color: var(--white); }

  .ds-risk-bar-wrap {
    width: 90px; height: 5px;
    background: rgba(255,255,255,0.1);
    border-radius: 99px;
    overflow: hidden;
  }

  .ds-risk-bar { height: 100%; border-radius: 99px; }
  .ds-risk-score { font-family: 'Syne', sans-serif; font-size: 0.88rem; font-weight: 700; min-width: 30px; text-align: right; }
  .ds-risk-badge { font-size: 0.7rem; font-weight: 500; padding: 0.15rem 0.6rem; border-radius: 100px; min-width: 55px; text-align: center; }

  .ds-badge-high { background: rgba(239,83,80,0.15); color: #ff8a80; }
  .ds-badge-med { background: rgba(255,171,0,0.15); color: #ffca28; }
  .ds-badge-low { background: rgba(0,191,165,0.15); color: var(--teal-light); }

  .ds-dash-footer {
    border-top: 1px solid var(--card-border);
    padding: 0.7rem 1.2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.75rem;
    color: var(--muted);
  }

  .ds-live-pill { display: flex; align-items: center; gap: 0.4rem; color: var(--teal-light); }

  /* ALERT DEMO */
  .ds-alert-demo {
    background: rgba(239,83,80,0.08);
    border: 1px solid rgba(239,83,80,0.2);
    border-radius: 12px;
    padding: 1.2rem 1.4rem;
    margin: 0 1.2rem 1.2rem;
  }

  .ds-alert-header {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #ff8a80;
    margin-bottom: 0.7rem;
  }

  .ds-alert-pulse {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--red-alert);
    display: inline-block;
    animation: dspulse 1.5s infinite;
  }

  .ds-alert-text { font-size: 0.88rem; color: var(--muted); line-height: 1.6; }
  .ds-alert-text strong { color: var(--white); font-weight: 500; }

  /* DISTRICTS */
  .ds-districts-section {
    padding: 5rem 2rem;
    max-width: 1100px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  .ds-districts-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-top: 3rem;
  }

  .ds-district-card {
    display: block;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 12px;
    color: inherit;
    padding: 1.5rem;
    position: relative;
    text-decoration: none;
    overflow: hidden;
    transition: border-color 0.3s, transform 0.2s;
  }

  .ds-district-card:hover { border-color: rgba(0,191,165,0.25); transform: translateY(-3px); }

  .ds-district-card::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 3px;
    border-radius: 0 0 12px 12px;
  }

  .ds-dc-punakha::after { background: var(--red-alert); }
  .ds-dc-samtse::after { background: var(--amber); }
  .ds-dc-sarpang::after { background: var(--amber); }
  .ds-dc-zhemgang::after { background: var(--teal); }

  .ds-district-icon { font-size: 1.6rem; margin-bottom: 0.8rem; }

  .ds-district-card h3 {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--white);
    margin-bottom: 0.3rem;
  }

  .ds-district-card p { font-size: 0.78rem; color: var(--muted); line-height: 1.5; }

  .ds-district-risk {
    margin-top: 1rem;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .ds-risk-high { color: #ff8a80; }
  .ds-risk-med { color: #ffca28; }
  .ds-risk-low { color: var(--teal-light); }

  /* CTA */
  .ds-cta-section {
    position: relative;
    z-index: 1;
    text-align: center;
    padding: 6rem 2rem;
    border-top: 1px solid var(--card-border);
    border-bottom: 1px solid var(--card-border);
    margin: 3rem 0;
    overflow: hidden;
  }

  .ds-cta-section::before {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 600px; height: 300px;
    background: radial-gradient(ellipse at center, rgba(0,191,165,0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  .ds-cta-section h2 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2rem, 4vw, 3.2rem);
    font-weight: 800;
    letter-spacing: -0.025em;
    max-width: 600px;
    margin: 0 auto 1rem;
    line-height: 1.1;
  }

  .ds-cta-section p {
    color: var(--muted);
    font-size: 1rem;
    max-width: 440px;
    margin: 0 auto 2.5rem;
    line-height: 1.7;
  }

  /* FOOTER */
  .ds-footer {
    position: relative;
    z-index: 1;
    padding: 2.5rem 4rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--card-border);
  }

  .ds-footer-logo {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    color: var(--white);
  }

  .ds-footer-logo span { color: var(--teal); }
  .ds-footer-note { font-size: 0.8rem; color: var(--muted); }

  /* ANIMATIONS */
  @keyframes dsfadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ds-fade-up {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }

  .ds-fade-up.ds-visible { opacity: 1; transform: translateY(0); }

  @media (max-width: 768px) {
    .ds-nav { padding: 1rem 1.5rem; }
    .ds-nav-links { display: none; }
    .ds-how-section { grid-template-columns: 1fr; gap: 3rem; }
    .ds-districts-grid { grid-template-columns: repeat(2, 1fr); }
    .ds-stats { flex-direction: column; gap: 2rem; }
    .ds-stat-item { border-right: none; border-bottom: 1px solid var(--card-border); padding: 0 0 1.5rem; }
    .ds-footer { flex-direction: column; gap: 1rem; text-align: center; padding: 2rem 1.5rem; }
  }
`;

const tickerItems = [
  { dot: "ds-dot-amber", text: "Punakha — Risk Score 72 · ADVISORY" },
  { dot: "ds-dot-green", text: "Samtse — Risk Score 34 · ALL CLEAR" },
  { dot: "ds-dot-amber", text: "Sarpang — Risk Score 61 · ADVISORY" },
  { dot: "ds-dot-green", text: "Zhemgang — Risk Score 18 · ALL CLEAR" },
  { dot: null,           text: "Last updated: 15 min ago · Open-Meteo API active" },
];

const features = [
  { icon: "🗺️", iconClass: "ds-icon-teal", title: "Live District Map", desc: "Colour-coded Bhutan map with real-time risk zones. Click any district for full rainfall, river level, and score breakdown." },
  { icon: "🤖", iconClass: "ds-icon-blue", title: "AI Risk Scoring Engine", desc: "Calculates flood risk score (0–100) every 15 minutes using rainfall forecasts, river rise estimation, and district sensitivity profiles." },
  { icon: "📱", iconClass: "ds-icon-amber", title: "Automated SMS Alerts", desc: "Instant bilingual alerts (English + Dzongkha) to farmers, local leaders, and officials when risk crosses threshold 70." },
  { icon: "🌧️", iconClass: "ds-icon-red",  title: "Simulation Mode", desc: "Simulate full monsoon events with rainfall and river level sliders — perfect for training, demos, and government presentations." },
  { icon: "📡", iconClass: "ds-icon-teal", title: "Open-Meteo API Integration", desc: "Free, no-key real-time rainfall forecasts for all target districts. Automatic fallback to last known data if connectivity drops." },
  { icon: "📊", iconClass: "ds-icon-blue", title: "Rainfall & River Charts", desc: "Interactive 24-hour charts powered by Chart.js. Spot trends and plan responses before risk scores peak." },
];

const steps = [
  { num: "01", title: "Collect rainfall forecast data", desc: "Open-Meteo API fetches rainfall forecasts for each district every 15 minutes, stored in local SQLite database." },
  { num: "02", title: "Estimate river level rise", desc: "Upstream accumulation is modelled to estimate river level rise percentage — even without real NCHM gauge data." },
  { num: "03", title: "Calculate flood risk score", desc: "AI engine scores each district 0–100 based on rainfall intensity, river rise, and district flood sensitivity." },
  { num: "04", title: "Send alerts before it's too late", desc: "When score > 70, bilingual SMS alerts are dispatched via Twilio — giving communities hours to prepare." },
];

const districtRows = [
  { name: "Punakha", width: "78%", color: "#ef5350", score: 78, scoreColor: "#ff8a80", badge: "HIGH", badgeClass: "ds-badge-high", bg: "rgba(239,83,80,0.07)" },
  { name: "Sarpang", width: "61%", color: "#ffab00", score: 61, scoreColor: "#ffca28", badge: "MED",  badgeClass: "ds-badge-med",  bg: "rgba(255,171,0,0.06)" },
  { name: "Samtse",  width: "34%", color: "#69f0ae", score: 34, scoreColor: "#69f0ae", badge: "LOW",  badgeClass: "ds-badge-low",  bg: "transparent" },
  { name: "Zhemgang",width: "18%", color: "#00bfa5", score: 18, scoreColor: "#64ffda", badge: "LOW",  badgeClass: "ds-badge-low",  bg: "transparent" },
];

const districts = [
  { id: "punakha", icon: "🏔️", name: "Punakha",  cardClass: "ds-dc-punakha",  riskClass: "ds-risk-high", risk: "⬤ High risk zone",   desc: "Mo Chhu & Pho Chhu river confluence. Historically highest GLOF risk in Bhutan." },
  { id: "samtse", icon: "🌿", name: "Samtse",   cardClass: "ds-dc-samtse",   riskClass: "ds-risk-med",  risk: "⬤ Medium risk zone", desc: "Southern border district with heavy monsoon rainfall and dense agricultural communities." },
  { id: "sarpang", icon: "🌊", name: "Sarpang",  cardClass: "ds-dc-sarpang",  riskClass: "ds-risk-med",  risk: "⬤ Medium risk zone", desc: "Foothills district with Sarpang Chhu river, prone to flash flooding during peak monsoon." },
  { id: "zhemgang", icon: "🌱", name: "Zhemgang", cardClass: "ds-dc-zhemgang", riskClass: "ds-risk-low",  risk: "⬤ Monitored zone",   desc: "Isolated terrain with limited road access, making early warning critical for communities." },
];

export default function DrukSafe() {
  const fadeRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("ds-visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    fadeRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addFadeRef = (el) => {
    if (el && !fadeRefs.current.includes(el)) fadeRefs.current.push(el);
  };

  const doubled = [...tickerItems, ...tickerItems];

  return (
    <>
      <style>{styles}</style>
      <div className="ds-body">

        {/* NAV */}
        <nav className="ds-nav">
          <Link href="/" className="ds-nav-logo">Druk<span>Safe</span></Link>
          <ul className="ds-nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#how">How it works</a></li>
            <li><Link href="/district">Districts</Link></li>
            <li><Link href="/dashboard" className="ds-nav-cta">Open Dashboard →</Link></li>
          </ul>
        </nav>

        {/* HERO */}
        <div className="ds-hero">
          <div className="ds-hero-badge">
            <span className="ds-badge-dot" />
            AI-Powered Early Warning System — Bhutan
          </div>
          <h1>
            Predict floods.<br />
            <span className="ds-accent">Protect lives.</span><br />
            <span className="ds-accent-amber">Hours before</span> they arrive.
          </h1>
          <p className="ds-hero-sub">
            DrukSafe monitors real-time rainfall across Bhutan&apos;s highest-risk districts,
            calculates flood risk scores using AI, and sends SMS alerts in English and
            Dzongkha — before floodwaters strike.
          </p>
          <div className="ds-hero-actions">
            <Link href="/dashboard" className="ds-btn-primary">View Live Dashboard →</Link>
            <a href="#how" className="ds-btn-secondary">See how it works</a>
          </div>
        </div>

        {/* TICKER */}
        <div className="ds-ticker-bar">
          <div className="ds-ticker-inner">
            {doubled.map((item, i) => (
              <span key={i} className="ds-ticker-item">
                {item.dot && <span className={`ds-status-dot ${item.dot}`} />}
                {item.text}
              </span>
            ))}
          </div>
        </div>

        {/* STATS */}
        <div className="ds-stats">
          {[
            { num: "4", sup: "+", label: "High-risk districts monitored", delay: "0.1s" },
            { num: "15", sup: "m", label: "Data refresh interval", delay: "0.2s" },
            { num: "6",  sup: "h", label: "Advance warning window", delay: "0.3s" },
            { num: "2",  sup: "x", label: "SMS alerts — English + Dzongkha", delay: "0.4s" },
          ].map((s, i) => (
            <div key={i} className="ds-stat-item" style={{ animationDelay: s.delay }}>
              <div className="ds-stat-num">{s.num}<span>{s.sup}</span></div>
              <div className="ds-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* FEATURES */}
        <section className="ds-section" id="features">
          <div ref={addFadeRef} className="ds-fade-up">
            <div className="ds-section-label">Core capabilities</div>
            <h2 className="ds-section-title">Everything needed to act before disaster strikes</h2>
            <p className="ds-section-sub">Built specifically for Bhutan&apos;s terrain, communities, and monsoon patterns — not a generic solution.</p>
          </div>
          <div ref={addFadeRef} className="ds-features-grid ds-fade-up" style={{ transitionDelay: "0.1s" }}>
            {features.map((f, i) => (
              <div key={i} className="ds-feature-card">
                <div className={`ds-feature-icon ${f.iconClass}`}>{f.icon}</div>
                <div className="ds-feature-title">{f.title}</div>
                <div className="ds-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <div className="ds-how-section" id="how">
          <div ref={addFadeRef} className="ds-fade-up">
            <div className="ds-section-label">How DrukSafe works</div>
            <h2 className="ds-section-title">Predict-and-protect, not detect-and-react</h2>
            <p className="ds-section-sub">DrukSafe shifts Bhutan from reactive disaster response to proactive community protection.</p>
            <div className="ds-steps-list">
              {steps.map((s, i) => (
                <div key={i} className="ds-step">
                  <div className="ds-step-num">{s.num}</div>
                  <div className="ds-step-content">
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DASHBOARD PREVIEW */}
          <div ref={addFadeRef} className="ds-fade-up" style={{ transitionDelay: "0.15s" }}>
            <div className="ds-dashboard-preview">
              <div className="ds-dash-titlebar">
                <span className="ds-dash-dot" style={{ background: "#ff5f57" }} />
                <span className="ds-dash-dot" style={{ background: "#ffbd2e" }} />
                <span className="ds-dash-dot" style={{ background: "#28c840" }} />
                <span style={{ fontSize: "0.75rem", color: "var(--muted)", marginLeft: "0.5rem" }}>
                  DrukSafe — District Risk Overview
                </span>
              </div>
              <div className="ds-dash-body">
                {districtRows.map((d, i) => (
                  <div key={i} className="ds-district-row" style={{ background: d.bg }}>
                    <span className="ds-district-name">{d.name}</span>
                    <div className="ds-risk-bar-wrap">
                      <div className="ds-risk-bar" style={{ width: d.width, background: d.color }} />
                    </div>
                    <span className="ds-risk-score" style={{ color: d.scoreColor }}>{d.score}</span>
                    <span className={`ds-risk-badge ${d.badgeClass}`}>{d.badge}</span>
                  </div>
                ))}
              </div>
              <div className="ds-alert-demo">
                <div className="ds-alert-header">
                  <span className="ds-alert-pulse" />
                  SMS Alert Dispatched — Punakha
                </div>
                <div className="ds-alert-text">
                  <strong>⚠️ FLOOD RISK HIGH — Punakha Dzongkhag</strong><br />
                  Rainfall: 94mm | River Rise: 31% | Score: 78/100<br />
                  Move to higher ground. Alert officials immediately.<br />
                  <span style={{ color: "#64ffda", fontSize: "0.8rem" }}>
                    དཀྲུག་བདེ། — གནས་ཚུལ་ཤེས་རྟོགས་བྱེད།
                  </span>
                </div>
              </div>
              <div className="ds-dash-footer">
                <span>Updated 2 min ago</span>
                <span className="ds-live-pill">
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--teal)", display: "inline-block", animation: "dspulse 2s infinite" }} />
                  Live
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* DISTRICTS */}
        <div className="ds-districts-section" id="districts">
          <div ref={addFadeRef} className="ds-fade-up">
            <div className="ds-section-label">Target districts</div>
            <h2 className="ds-section-title">Bhutan&apos;s highest flood-risk dzongkhags</h2>
          </div>
          <div ref={addFadeRef} className="ds-districts-grid ds-fade-up" style={{ transitionDelay: "0.1s" }}>
            {districts.map((d, i) => (
              <Link key={i} className={`ds-district-card ${d.cardClass}`} href={`/district?district=${d.id}`}>
                <div className="ds-district-icon">{d.icon}</div>
                <h3>{d.name}</h3>
                <p>{d.desc}</p>
                <div className={`ds-district-risk ${d.riskClass}`}>{d.risk}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="ds-cta-section">
          <h2>Ready to see DrukSafe in action?</h2>
          <p>Open the live dashboard, explore the simulation mode, or dive into the code on GitHub.</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/dashboard" className="ds-btn-primary">Open Dashboard →</Link>
            <a href="https://github.com" className="ds-btn-secondary">View on GitHub</a>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="ds-footer">
          <div className="ds-footer-logo">Druk<span>Safe</span></div>
          <div className="ds-footer-note">Built for Bhutan · TechBiz Bootcamp · 2025</div>
          <div className="ds-footer-note">Data: Open-Meteo API · Alerts: Twilio · Map: Leaflet.js</div>
        </footer>

      </div>
    </>
  );
}
