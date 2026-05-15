import { buildGoogleMapsEmbedUrl } from "@/lib/google-maps";

export default function FloodRiskMap({ districts, selectedId, onSelect }) {
  const mapSource = buildGoogleMapsEmbedUrl();

  return (
    <div className="map-canvas" aria-label="Bhutan district flood risk map">
      <iframe
        allowFullScreen
        className="google-map-frame"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={mapSource}
        title="Google map of Bhutan"
      />
      <div className="map-scrim" aria-hidden="true" />
      <div className="map-grid" aria-hidden="true" />

      {districts.map((district) => (
        <button
          className={`district-marker ${selectedId === district.id ? "is-selected" : ""}`}
          key={district.id}
          onClick={() => onSelect(district.id)}
          style={{
            left: district.map.left,
            top: district.map.top,
            "--risk-color": district.level.color,
            "--risk-soft": district.level.soft,
          }}
          type="button"
        >
          <span className="district-marker-dot" />
          <span className="min-w-0 truncate">{district.name}</span>
          <strong>{district.score}</strong>
        </button>
      ))}
    </div>
  );
}
