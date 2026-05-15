export default function ReadingTile({ label, value }) {
  return (
    <div className="min-w-0 rounded-md border border-[#d8e2dc] bg-[#f8fbf9] p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6d7d78]">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold leading-5 text-[#203a36]">
        {value}
      </p>
    </div>
  );
}
