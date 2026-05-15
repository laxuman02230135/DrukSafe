import { INTEGRATIONS } from "@/lib/dashboard-config";

export default function IntegrationPanel() {
  return (
    <section className="rounded-lg border border-[#d8e2dc] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Prototype integrations</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {INTEGRATIONS.map((item) => (
          <div
            className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-[#d8e2dc] bg-[#f8fbf9] p-3"
            key={item.name}
          >
            <div>
              <p className="font-semibold text-[#243f3b]">{item.name}</p>
              <p className="text-sm text-[#667871]">{item.status}</p>
            </div>
            <span
              className={`h-2.5 w-2.5 rounded-sm ${
                item.tone === "ready" ? "bg-[#047857]" : "bg-[#b54708]"
              }`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
