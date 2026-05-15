"use client";

export default function RiskCard({ district, isSelected, onSelect, t }) {
  return (
    <button
      className={`risk-card ${isSelected ? "is-selected" : ""}`}
      onClick={() => onSelect(district.id)}
      style={{
        "--risk-color": district.level.color,
        "--risk-bg": district.level.soft,
      }}
      type="button"
    >
      <span className="risk-card-topline">
        <span>{district.river}</span>
        <strong>{district.level.label}</strong>
      </span>
      <span className="risk-card-title">{district.name}</span>
      <span className="risk-card-dz">{district.dzongkha}</span>

      <span className="risk-progress" aria-hidden="true">
        <span style={{ width: `${district.riskScore}%` }} />
      </span>

      <span className="risk-card-metrics">
        <span>
          {t.rainfall}
          <strong>{district.rainfall}mm</strong>
        </span>
        <span>
          {t.riverRise}
          <strong>{district.riverRise}%</strong>
        </span>
        <span>
          {t.riskScore}
          <strong>{district.riskScore}</strong>
        </span>
      </span>
    </button>
  );
}
