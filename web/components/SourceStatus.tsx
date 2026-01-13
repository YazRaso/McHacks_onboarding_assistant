import React from "react";

type Props = {
  drive?: { connected: boolean; lastUpdated?: string };
  codebase?: { connected: boolean; lastUpdated?: string };
  telegram?: { connected: boolean; lastUpdated?: string };
  summarizer?: {
    status: "idle" | "running" | "failed" | "ok";
    lastRun?: string;
  };
};

export default function SourceStatus({
  drive,
  codebase,
  telegram,
  summarizer,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 bg-white rounded shadow">
        <h3 className="text-lg font-medium">Sources</h3>
        <ul className="mt-3 space-y-2">
          <li className="flex justify-between items-center">
            <div>
              <div className="font-semibold">Drive</div>
              <div className="text-sm text-slate-500">
                {drive?.lastUpdated ?? "Never"}
              </div>
            </div>
            <div
              className={`px-2 py-1 rounded-full text-sm ${
                drive?.connected
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {drive?.connected ? "Connected" : "Disconnected"}
            </div>
          </li>

          <li className="flex justify-between items-center">
            <div>
              <div className="font-semibold">Codebase</div>
              <div className="text-sm text-slate-500">
                {codebase?.lastUpdated ?? "Never"}
              </div>
            </div>
            <div
              className={`px-2 py-1 rounded-full text-sm ${
                codebase?.connected
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {codebase?.connected ? "Connected" : "Disconnected"}
            </div>
          </li>

          <li className="flex justify-between items-center">
            <div>
              <div className="font-semibold">Telegram</div>
              <div className="text-sm text-slate-500">
                {telegram?.lastUpdated ?? "Never"}
              </div>
            </div>
            <div
              className={`px-2 py-1 rounded-full text-sm ${
                telegram?.connected
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {telegram?.connected ? "Connected" : "Disconnected"}
            </div>
          </li>
        </ul>
      </div>

      <div className="p-4 bg-white rounded shadow">
        <h3 className="text-lg font-medium">Summarizer / Context Extractor</h3>
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Status</div>
              <div className="text-sm text-slate-500">
                {summarizer?.lastRun ?? "Never run"}
              </div>
            </div>
            <div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  summarizer?.status === "running"
                    ? "bg-yellow-100 text-yellow-800"
                    : summarizer?.status === "ok"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {summarizer?.status}
              </span>
            </div>
          </div>

          <div className="mt-4 text-sm text-slate-600">
            The summarizer extracts highlights from connected sources and pushes
            to Backboard LLM Memory. You can enable the Demo Repo toggle under
            Connected Apps to use hardcoded demo configuration.
          </div>
        </div>
      </div>
    </div>
  );
}
