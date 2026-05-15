export default function SegmentedControl({
  className = "",
  label,
  options,
  value,
  onChange,
}) {
  return (
    <div
      className={`segmented-control flex h-10 shrink-0 items-center rounded-md border border-[#b9c9c2] bg-[#f6faf8] p-1 ${className}`}
    >
      <span className="sr-only">{label}</span>
      {options.map((option) => (
        <button
          className={`h-8 whitespace-nowrap rounded px-3 text-sm font-semibold transition ${
            value === option.value
              ? "bg-[#0f5c5c] text-white shadow-sm"
              : "text-[#46615b] hover:bg-white"
          }`}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
