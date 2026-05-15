function RangeControl({ label, min, max, value, suffix, onChange }) {
  return (
    <label className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-[#304b46]">{label}</span>
        <span className="rounded bg-[#eef6f4] px-2 py-1 font-semibold text-[#0f5c5c]">
          {value}
          {suffix}
        </span>
      </div>
      <input
        className="accent-[#0f5c5c]"
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        type="range"
        value={value}
      />
    </label>
  );
}

export default function SimulationPanel({
  mode,
  running,
  rainfall,
  river,
  t,
  onRainfall,
  onRiver,
  onStart,
  onStop,
  onReset,
}) {
  return (
    <section className="rounded-lg border border-[#d8e2dc] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{t.simulateEvent}</h2>
          <p className="text-sm text-[#667871]">
            {mode === "simulation" ? t.simulation : "Ready for training mode"}
          </p>
        </div>
        <span
          className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
            mode === "simulation"
              ? "bg-[#fef0c7] text-[#7a2e0e]"
              : "bg-[#eef6f4] text-[#0f5c5c]"
          }`}
        >
          {mode === "simulation" ? t.simulation : t.live}
        </span>
      </div>

      <div className="mt-6 grid gap-5">
        <RangeControl
          label={t.rainSlider}
          max={140}
          min={0}
          suffix="mm"
          value={rainfall}
          onChange={onRainfall}
        />
        <RangeControl
          label={t.riverSlider}
          max={60}
          min={0}
          suffix="%"
          value={river}
          onChange={onRiver}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <button
          className="rounded-md bg-[#0f5c5c] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0b4f4e]"
          onClick={running ? onStop : onStart}
          type="button"
        >
          {running ? t.stopSimulation : t.simulateEvent}
        </button>
        <button
          className="rounded-md border border-[#b9c9c2] px-3 py-2 text-sm font-semibold text-[#21413d] transition hover:bg-[#edf4f1]"
          onClick={onReset}
          type="button"
        >
          {t.resetSimulation}
        </button>
      </div>
    </section>
  );
}
