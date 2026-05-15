export const REFRESH_INTERVAL_MS = 15 * 60 * 1000;
export const ALERT_COOLDOWN_MS = 60 * 60 * 1000;
export const HIGH_RISK_THRESHOLD = 70;

export const DISTRICTS = [
  {
    id: "punakha",
    name: "Punakha",
    dzongkha: "སྤུ་ན་ཁ་",
    latitude: 27.59,
    longitude: 89.87,
    sensitivity: 1.12,
    basin: "Pho Chhu / Mo Chhu",
    population: "82k",
    lead: "Dzongkhag disaster focal point",
    rainfall: 42,
    riverRise: 14,
    map: { left: "50%", top: "36%" },
    history: [16, 22, 35, 42, 48, 53, 46, 42],
  },
  {
    id: "wangdue",
    name: "Wangdue Phodrang",
    dzongkha: "དབང་འདུས་ཕོ་བྲང་",
    latitude: 27.49,
    longitude: 89.9,
    sensitivity: 1.2,
    basin: "Punatsang Chhu",
    population: "73k",
    lead: "Gewog administrators",
    rainfall: 62,
    riverRise: 21,
    map: { left: "57%", top: "46%" },
    history: [24, 31, 44, 57, 68, 72, 66, 62],
  },
  {
    id: "sarpang",
    name: "Sarpang",
    dzongkha: "གསར་སྤང་",
    latitude: 26.86,
    longitude: 90.27,
    sensitivity: 1.26,
    basin: "Mao Khola / Sarpang Chhu",
    population: "46k",
    lead: "Southern response cell",
    rainfall: 78,
    riverRise: 24,
    map: { left: "71%", top: "72%" },
    history: [31, 45, 58, 73, 88, 95, 86, 78],
  },
  {
    id: "samtse",
    name: "Samtse",
    dzongkha: "བསམ་རྩེ་",
    latitude: 26.9,
    longitude: 89.1,
    sensitivity: 1.16,
    basin: "Amo Chhu",
    population: "61k",
    lead: "Local leaders and farm groups",
    rainfall: 55,
    riverRise: 17,
    map: { left: "25%", top: "66%" },
    history: [18, 26, 41, 52, 59, 64, 60, 55],
  },
];

export const COPY = {
  en: {
    appName: "DrukSafe",
    strapline: "AI-powered flood prediction and early warning for Bhutan",
    operations: "Flood operations dashboard",
    live: "Live data",
    simulation: "Simulation",
    simulateEvent: "Simulate Monsoon Event",
    stopSimulation: "Stop simulation",
    resetSimulation: "Reset",
    refresh: "Refresh data",
    language: "Language",
    allClear: "ALL CLEAR",
    advisory: "ADVISORY",
    alertActive: "ALERT ACTIVE",
    dataStale: "DATA STALE",
    lastUpdated: "Last updated",
    source: "Source",
    globalStatus: "Global status",
    highestRisk: "Highest risk",
    districtsWatched: "Districts watched",
    smsQueue: "SMS queue",
    minutes: "minutes",
    mapTitle: "Bhutan flood-risk map",
    mapSubtitle: "Four v1 target dzongkhags with predictive risk scores",
    rainfall: "Rainfall",
    riverRise: "River rise",
    riskScore: "Risk score",
    forecast: "72h rainfall trend",
    selectedDistrict: "District detail",
    recipients: "Alert recipients",
    smsAlerts: "SMS alert center",
    english: "English",
    dzongkha: "Dzongkha",
    threshold: "High-risk threshold",
    cooldown: "Duplicate cooldown",
    demoFallback: "Screen simulation fallback",
    staleWarning: "Showing last valid forecast because live data is unavailable.",
    noAlerts: "No threshold breach has been dispatched in this session.",
    action: "Move livestock and tools away from riverbanks. Monitor local officials.",
    admin: "Admin controls",
    rainSlider: "Rainfall input",
    riverSlider: "River input",
    prototype: "Prototype integrations",
  },
  dz: {
    appName: "འབྲུག་སེབ་",
    strapline: "འབྲུག་གི་ཆུ་ལོག་སྔོན་བརྡ་མ་ལག",
    operations: "ཆུ་ལོག་ལས་སྐོར་ཌེཤ་བོརཌ",
    live: "དངོས་དུས་གནས་སྡུད",
    simulation: "སྦྱོང་བརྡར",
    simulateEvent: "ཆར་ཆུ་ཆེན་པོ་སྦྱོང་བརྡར",
    stopSimulation: "སྦྱོང་བརྡར་བཀག",
    resetSimulation: "སྐྱར་སྒྲིག",
    refresh: "གནས་སྡུད་གསརཔ",
    language: "སྐད་ཡིག",
    allClear: "ཉེན་ཁ་མེད",
    advisory: "བརྡ་བསྐུལ",
    alertActive: "ཉེན་བརྡ་འགོ་བཙུགས",
    dataStale: "གནས་སྡུད་རྙིངམ",
    lastUpdated: "མཐའ་མཇུག་གསརཔ",
    source: "འབྱུང་ཁུངས",
    globalStatus: "སྤྱིར་བཏང་གནས་ཚད",
    highestRisk: "ཉེན་ཁ་མཐོ་ཤོས",
    districtsWatched: "ལྟ་རྟོག་རྫོང་ཁག",
    smsQueue: "SMS གྲ་སྒྲིག",
    minutes: "སྐར་མ",
    mapTitle: "འབྲུག་ཆུ་ལོག་ཉེན་ཁ་ས་ཁྲ",
    mapSubtitle: "རྫོང་ཁག་བཞིའི་སྔོན་དཔག་ཉེན་ཁ་སྐུགས",
    rainfall: "ཆརཔ",
    riverRise: "ཆུ་ཚད་འཕར",
    riskScore: "ཉེན་ཁ་སྐུགས",
    forecast: "ཆུ་ཚོད་72 ཆརཔ་འགྱུར་བ",
    selectedDistrict: "རྫོང་ཁག་གསལ་བཤད",
    recipients: "ཉེན་བརྡ་ཐོབ་མི",
    smsAlerts: "SMS ཉེན་བརྡ",
    english: "English",
    dzongkha: "རྫོང་ཁ",
    threshold: "ཉེན་ཁ་མཐོ་བའི་ཚད",
    cooldown: "བསྐྱར་ཉེན་བརྡ་དུས་ཚོད",
    demoFallback: "གསལ་ཤེལ་སྦྱོང་བརྡར",
    staleWarning: "དངོས་དུས་གནས་སྡུད་མེདཔ་ལས་མཐའ་མཇུག་གནས་སྡུད་སྟོནམ་ཨིན།",
    noAlerts: "ད་ལྟོའི་སྐབས་ཉེན་བརྡ་གཏང་མ་དགོ",
    action: "གཙང་ཆུའི་འགྲམ་ལས་ཕྱུགས་དང་ལག་ཆས་སྤོ། གཞུང་ལས་བརྡ་ཁྱབ་ཉན།",
    admin: "འཛིན་སྐྱོང་ཚད་འཛིན",
    rainSlider: "ཆརཔ་ནང་འཇུག",
    riverSlider: "ཆུ་ཚད་ནང་འཇུག",
    prototype: "སྔོན་དཔེ་མཐུད་སྦྲེལ",
  },
};

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function calculateRiskScore(rainfall, riverRise, sensitivity) {
  const baseScore = rainfall * 0.55 + riverRise * 1.1 + (sensitivity - 1) * 22;
  const thresholdBoost = rainfall > 80 && riverRise > 20 ? 12 : 0;
  const surgeBoost = rainfall > 110 || riverRise > 34 ? 8 : 0;

  return Math.round(clamp(baseScore + thresholdBoost + surgeBoost, 0, 100));
}

export function getRiskLevel(score) {
  if (score >= HIGH_RISK_THRESHOLD) {
    return {
      key: "high",
      label: "High",
      status: "ALERT ACTIVE",
      color: "#b42318",
      soft: "#fee4e2",
      text: "#7a271a",
    };
  }

  if (score >= 45) {
    return {
      key: "advisory",
      label: "Moderate",
      status: "ADVISORY",
      color: "#b54708",
      soft: "#fef0c7",
      text: "#7a2e0e",
    };
  }

  return {
    key: "clear",
    label: "Low",
    status: "ALL CLEAR",
    color: "#047857",
    soft: "#d1fadf",
    text: "#065f46",
  };
}

export function buildFallbackReadings() {
  return Object.fromEntries(
    DISTRICTS.map((district) => [
      district.id,
      {
        rainfall: district.rainfall,
        riverRise: district.riverRise,
        history: district.history,
        currentRainfall: null,
        peakDischarge: null,
        precipitationProbability: null,
        riverDischarge: null,
        updatedAt: null,
      },
    ])
  );
}

export function estimateRiverRise(rainfall, district) {
  return Math.round(
    clamp(district.riverRise * 0.55 + rainfall * district.sensitivity * 0.36, 4, 68)
  );
}

export function enrichDistricts(readings) {
  return DISTRICTS.map((district) => {
    const current = readings[district.id] ?? {};
    const rainfall = Math.round(current.rainfall ?? district.rainfall);
    const riverRise = Math.round(current.riverRise ?? district.riverRise);
    const score = calculateRiskScore(rainfall, riverRise, district.sensitivity);

    return {
      ...district,
      rainfall,
      riverRise,
      score,
      level: getRiskLevel(score),
      history: current.history?.length ? current.history : district.history,
      currentRainfall: current.currentRainfall ?? null,
      floodSource: current.floodSource ?? "Estimated",
      peakDischarge: current.peakDischarge ?? null,
      precipitationProbability: current.precipitationProbability ?? null,
      riverDischarge: current.riverDischarge ?? null,
      updatedAt: current.updatedAt ?? null,
    };
  });
}

export function getGlobalStatus(districts) {
  if (districts.some((district) => district.score >= HIGH_RISK_THRESHOLD)) {
    return {
      key: "high",
      copyKey: "alertActive",
      label: "ALERT ACTIVE",
      color: "#b42318",
      soft: "#fee4e2",
    };
  }

  if (districts.some((district) => district.score >= 45)) {
    return {
      key: "advisory",
      copyKey: "advisory",
      label: "ADVISORY",
      color: "#b54708",
      soft: "#fef0c7",
    };
  }

  return {
    key: "clear",
    copyKey: "allClear",
    label: "ALL CLEAR",
    color: "#047857",
    soft: "#d1fadf",
  };
}

export function createSimulationReadings(rainfallInput, riverInput) {
  return Object.fromEntries(
    DISTRICTS.map((district, index) => {
      const rainFactor = 0.48 + index * 0.09;
      const riverFactor = 0.42 + index * 0.08;
      const rainfall = clamp(district.rainfall * 0.45 + rainfallInput * rainFactor, 0, 160);
      const riverRise = clamp(district.riverRise * 0.55 + riverInput * riverFactor, 0, 70);
      const history = district.history.map((value, point) =>
        Math.round(clamp(value * 0.58 + rainfall * (0.28 + point * 0.035), 0, 150))
      );

      return [
        district.id,
        {
          rainfall,
          riverRise,
          history,
          currentRainfall: null,
          floodSource: "Simulation",
          peakDischarge: null,
          precipitationProbability: null,
          riverDischarge: null,
          updatedAt: new Date().toISOString(),
        },
      ];
    })
  );
}

export function composeAlertMessages(district, actionText) {
  return {
    english: `Flood alert for ${district.name}: risk ${district.score}/100, rainfall ${district.rainfall} mm, river rise ${district.riverRise}%. ${actionText}`,
    dzongkha: `${district.dzongkha}: ཆུ་ལོག་ཉེན་བརྡ། ཉེན་ཁ་ ${district.score}/100, ཆརཔ ${district.rainfall} mm, ཆུ་ཚད་ ${district.riverRise}%. ${COPY.dz.action}`,
  };
}
