"use client";

import { useState } from "react";
import DemoToggle from "./DemoToggle";
import SourceStatus from "./SourceStatus";

export default function ConnectedClient() {
  const [demoEnabled, setDemoEnabled] = useState(true);

  const drive = {
    connected: demoEnabled ? true : false,
    lastUpdated: "2026-01-12 12:20 UTC",
  };
  const codebase = {
    connected: demoEnabled ? true : false,
    lastUpdated: "2026-01-12 12:20 UTC",
  };
  const telegram = { connected: false };
  const summarizer = {
    status: demoEnabled ? "ok" : ("idle" as const),
    lastRun: demoEnabled ? "2026-01-12 12:20 UTC" : undefined,
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Connected Apps</h2>
      <DemoToggle
        enabled={demoEnabled}
        onToggle={() => setDemoEnabled(!demoEnabled)}
      />

      <SourceStatus
        drive={drive}
        codebase={codebase}
        telegram={telegram}
        summarizer={summarizer}
      />

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-medium">Manual Connectors</h3>
        <p className="text-sm text-slate-600">
          In production these would be connected via OAuth and webhooks to push
          updates into Backboard memory.
        </p>
      </div>
    </div>
  );
}
