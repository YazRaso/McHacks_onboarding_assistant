import SourceStatus from "../../components/SourceStatus";

export default function MemoryPage() {
  // Hardcoded demo statuses for now
  const drive = { connected: true, lastUpdated: "2026-01-12 10:02 UTC" };
  const codebase = { connected: true, lastUpdated: "2026-01-12 09:55 UTC" };
  const telegram = { connected: false };
  const summarizer = { status: "ok" as const, lastRun: "2026-01-12 10:30 UTC" };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Memory Overview</h2>
      <p className="text-sm text-slate-600 mb-4">
        Overview of connected sources and last synchronization times.
      </p>

      <SourceStatus
        drive={drive}
        codebase={codebase}
        telegram={telegram}
        summarizer={summarizer}
      />

      <div className="mt-6 bg-white p-4 rounded shadow">
        <h3 className="font-medium">Activity Log</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li>
            ✅ Context updated from commit{" "}
            <code className="bg-slate-100 px-2 py-0.5 rounded">abc1234</code> -
            2026-01-12 09:54 UTC
          </li>
          <li>🔁 Summarizer ran automatically - 2026-01-12 10:30 UTC</li>
          <li>⚠️ Telegram sync failed - 2026-01-11 20:05 UTC</li>
        </ul>
      </div>
    </div>
  );
}
