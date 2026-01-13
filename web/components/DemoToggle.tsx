import React from "react";

export default function DemoToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="p-4 bg-white rounded shadow flex items-center justify-between">
      <div>
        <div className="font-semibold">Demo Repo Configuration</div>
        <div className="text-sm text-slate-500">
          Enable the hardcoded demo repo and demo integrations for a guided
          experience.
        </div>
      </div>
      <div>
        <button
          onClick={onToggle}
          className={`px-4 py-2 rounded ${
            enabled ? "bg-green-600 text-white" : "bg-gray-200 text-slate-700"
          }`}
        >
          {enabled ? "Enabled" : "Enable"}
        </button>
      </div>
    </div>
  );
}
