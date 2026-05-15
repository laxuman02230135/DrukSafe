"use client";

import { useEffect, useRef, useState } from "react";
import {
  ALERT_COOLDOWN_MS,
  COPY,
  HIGH_RISK_THRESHOLD,
  composeAlertMessages,
} from "@/lib/druksafe-data";

export function useFloodAlerts({ dataLoading, districts, mode }) {
  const [alertLog, setAlertLog] = useState([]);
  const lastAlertRef = useRef({});

  useEffect(() => {
    if (mode === "live" && dataLoading) {
      return;
    }

    const highRiskDistricts = districts.filter(
      (district) => district.score >= HIGH_RISK_THRESHOLD
    );
    const now = Date.now();

    highRiskDistricts.forEach((district) => {
      const previousAlertAt = lastAlertRef.current[district.id] ?? 0;
      if (now - previousAlertAt < ALERT_COOLDOWN_MS) {
        return;
      }

      lastAlertRef.current[district.id] = now;
      const messages = composeAlertMessages(district, COPY.en.action);
      const alert = {
        id: `${district.id}-${now}`,
        district: district.name,
        score: district.score,
        mode,
        sentAt: new Date(now).toISOString(),
        messages,
      };

      setAlertLog((current) => [alert, ...current].slice(0, 6));

      fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          district: district.name,
          score: district.score,
          messages,
          recipients: [],
        }),
      }).catch(() => {});
    });
  }, [dataLoading, districts, mode]);

  return { alertLog };
}
