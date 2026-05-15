"use client";

import { useEffect, useRef, useState } from "react";

function popupHtml(district) {
  return `
    <div class="leaflet-popup-card">
      <strong>${district.name}</strong>
      <span>${district.river}</span>
      <span>Risk ${district.riskScore}/100 · ${district.level.label}</span>
    </div>
  `;
}

export default function LeafletMapClient({ districts, selectedId, onSelect }) {
  const containerRef = useRef(null);
  const layerRef = useRef(null);
  const leafletRef = useRef(null);
  const mapRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function createMap() {
      const leaflet = await import("leaflet");
      const L = leaflet.default;

      if (!mounted || !containerRef.current || mapRef.current) {
        return;
      }

      leafletRef.current = L;
      const map = L.map(containerRef.current, {
        attributionControl: true,
        maxBounds: [
          [26.55, 88.6],
          [28.35, 91.05],
        ],
        minZoom: 7,
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView([27.45, 90.05], 7);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setReady(true);
    }

    createMap();

    return () => {
      mounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      leafletRef.current = null;
    };
  }, []);

  useEffect(() => {
    const L = leafletRef.current;
    const layer = layerRef.current;

    if (!L || !layer) {
      return;
    }

    layer.clearLayers();

    districts.forEach((district) => {
      const selected = district.id === selectedId;
      const marker = L.circleMarker([district.latitude, district.longitude], {
        color: district.level.color,
        fillColor: district.level.color,
        fillOpacity: selected ? 0.72 : 0.5,
        opacity: 1,
        radius: selected ? 18 : 13,
        weight: selected ? 4 : 2,
      });

      marker.on("click", () => onSelect(district.id));
      marker.bindPopup(popupHtml(district));

      if (selected) {
        marker
          .bindTooltip(`${district.name} · ${district.riskScore}`, {
            className: "map-tooltip",
            direction: "top",
            offset: [0, -8],
            permanent: true,
          })
          .openTooltip();
        mapRef.current?.panTo([district.latitude, district.longitude], {
          animate: true,
          duration: 0.45,
        });
      }

      marker.addTo(layer);
    });
  }, [districts, onSelect, ready, selectedId]);

  return (
    <div className="leaflet-map-container">
      <div className="leaflet-dashboard-map" ref={containerRef} />
      {!ready ? <div className="map-loading">Loading Leaflet map</div> : null}
    </div>
  );
}
