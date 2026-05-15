"use client";

export default function LanguageToggle({ language, onChange }) {
  const isDzongkha = language === "dz";

  return (
    <button
      aria-label="Toggle language"
      className="language-toggle"
      onClick={() => onChange(isDzongkha ? "en" : "dz")}
      type="button"
    >
      <span className={!isDzongkha ? "is-active" : ""}>EN</span>
      <span className={isDzongkha ? "is-active" : ""}>DZ</span>
      <span
        aria-hidden="true"
        className="language-toggle-thumb"
        data-position={isDzongkha ? "dz" : "en"}
      />
    </button>
  );
}
