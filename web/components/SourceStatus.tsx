import React from "react";
import { EventSource as DataSource } from "../lib/api";

type Props = {
  drive?: { connected: boolean; lastUpdated?: string };
  codebase?: { connected: boolean; lastUpdated?: string };
  telegram?: { connected: boolean; lastUpdated?: string };
  summarizer?: {
    status: "idle" | "running" | "failed" | "ok";
    lastRun?: string;
  };
  activeSource?: DataSource | null;
};

export default function SourceStatus({
  drive,
  codebase,
  telegram,
  summarizer,
  activeSource,
}: Props) {
  const sources = [
    { name: "Google Drive", data: drive, icon: "add_to_drive", sourceKey: "drive" as DataSource },
    { name: "Codebase", data: codebase, icon: "terminal", sourceKey: "repo" as DataSource },
    { name: "Telegram Bot", data: telegram, icon: "send", sourceKey: "telegram" as DataSource },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
      <div className="glass-card p-6 rounded-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="material-symbols-outlined text-zinc-400">tune</div>
          <h3 className="text-lg font-bold">Data Sources</h3>
        </div>
        <div className="space-y-4">
          {sources.map((source) => {
            const isActive = activeSource === source.sourceKey;
            return (
              <div
                key={source.name}
                className={`flex justify-between items-center p-4 bg-zinc-900/50 rounded-2xl border transition-all duration-300 ${
                  isActive
                    ? "border-blue-500/50 bg-blue-950/30 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    : "border-zinc-800/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`relative`}>
                    <div
                      className={`material-symbols-outlined text-2xl transition-all duration-300 ${
                        isActive ? "text-blue-400 scale-110" : "opacity-80 text-zinc-400"
                      }`}
                    >
                      {source.icon}
                    </div>
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-3 h-3">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className={`font-semibold transition-colors duration-300 ${isActive ? "text-blue-300" : ""}`}>
                      {source.name}
                      {isActive && <span className="ml-2 text-xs text-blue-400 animate-pulse">syncing...</span>}
                    </div>
                    <div className="text-xs text-zinc-500">
                      Sync: {source.data?.lastUpdated ?? "Never"}
                    </div>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isActive
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : source.data?.connected
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-500 border border-red-500/20"
                  }`}
                >
                  {isActive ? "Syncing" : source.data?.connected ? "Online" : "Offline"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card p-6 rounded-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="material-symbols-outlined text-zinc-400">smart_toy</div>
          <h3 className="text-lg font-bold">Intelligence Engine</h3>
        </div>
        <div className="space-y-6">
          <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-zinc-400">Memory Sync Status</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${summarizer?.status === "running"
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  : summarizer?.status === "ok"
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                  }`}
              >
                {summarizer?.status || "Idle"}
              </span>
            </div>
            <div className="text-sm font-bold">{summarizer?.lastRun || "No activity recorded"}</div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Processing Insights</h4>
            <p className="text-sm text-zinc-400 leading-relaxed">
              The extraction pipeline is monitoring connected nodes for updates.
              New fragments are automatically vector-indexed into your Backboard LLM Memory.
            </p>
            <div className="pt-2">
              <button className="btn-secondary w-full py-2.5 text-sm">
                Manually Request Sync
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
