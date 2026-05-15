"use client";

import LeafletMap from "@/components/LeafletMapClient";

export default function FloodMap({ districts, selectedId, onSelect, t }) {
  return (
    <section className="dashboard-panel map-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{t.mapTitle}</p>
          <h2>{t.mapSubtitle}</h2>
        </div>
        <div className="map-legend" aria-label="Risk legend">
          <span>
            <i className="legend-low" /> LOW
          </span>
          <span>
            <i className="legend-medium" /> MEDIUM
          </span>
          <span>
            <i className="legend-high" /> HIGH
          </span>
        </div>
      </div>
      <div className="leaflet-map-shell">
        <LeafletMap districts={districts} onSelect={onSelect} selectedId={selectedId} />
      </div>
    </section>
  );
}
