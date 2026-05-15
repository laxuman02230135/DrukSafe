import { DISTRICTS } from "@/data/districts";
import {
  ALERT_COOLDOWN_MS,
  HIGH_RISK_THRESHOLD,
  REFRESH_INTERVAL_MS,
  buildFallbackReadings,
  calculateRiskScore as calculateWeightedRiskScore,
  clamp,
  createSimulationReadings,
  enrichDistricts,
  estimateRiverRise,
  getGlobalStatus,
  getRiskLevel,
} from "@/lib/riskEngine";
import { TRANSLATIONS } from "@/lib/translations";

export {
  ALERT_COOLDOWN_MS,
  DISTRICTS,
  HIGH_RISK_THRESHOLD,
  REFRESH_INTERVAL_MS,
  buildFallbackReadings,
  clamp,
  createSimulationReadings,
  enrichDistricts,
  estimateRiverRise,
  getGlobalStatus,
  getRiskLevel,
};

export const COPY = TRANSLATIONS;

export function calculateRiskScore(rainfall, riverRise, sensitivity = 1) {
  return calculateWeightedRiskScore({
    rainfall,
    riverRise,
    vulnerability: Math.min(1, Math.max(0.5, sensitivity - 0.32)),
  });
}

export function composeAlertMessages(district, actionText = TRANSLATIONS.en.action) {
  return {
    english: `Flood alert for ${district.name}: risk ${district.score ?? district.riskScore}/100, rainfall ${district.rainfall} mm, river rise ${district.riverRise}%. ${actionText}`,
    dzongkha: `${district.dzongkha}: ཆུ་ལོག་ཉེན་བརྡ། ཉེན་སྐུགས་ ${district.score ?? district.riskScore}/100, ཆརཔ་ ${district.rainfall} mm, ཆུ་ཚད་ ${district.riverRise}%. ${TRANSLATIONS.dz.action}`,
  };
}
