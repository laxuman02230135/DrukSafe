"use client";

import { useEffect, useRef, useState } from "react";
import { ALERT_RECIPIENTS } from "@/data/districts";
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
      (district) => district.riskScore > HIGH_RISK_THRESHOLD
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
        score: district.riskScore,
        mode,
        sentAt: new Date(now).toISOString(),
        messages,
        deliveries: [],
      };

      setAlertLog((current) => [alert, ...current].slice(0, 6));

      fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          district: district.name,
          districtId: district.id,
          rainfall: district.rainfall,
          recipients: ALERT_RECIPIENTS.map((recipient) => recipient.phone),
          riskScore: district.riskScore,
          riverRise: district.riverRise,
        }),
      })
        .then((response) => response.json())
        .then((result) => {
          setAlertLog((current) =>
            current.map((item) =>
              item.id === alert.id
                ? {
                    ...item,
                    deliveries: result.deliveries ?? [],
                    dispatchMode: result.mode,
                  }
                : item
            )
          );
        })
        .catch(() => {});
    });
  }, [dataLoading, districts, mode]);

  return { alertLog };
}
