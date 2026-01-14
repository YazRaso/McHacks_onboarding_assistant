"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { API } from "../../lib/api";

export default function LiveTrackingPage() {
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await API.getActivity();
        if (data.length > 0) {
          setUpdates(data);
        } else {
          // Fallback to mock data for demo if DB is empty
          setUpdates([
            { source: "GitHub", title: "New commit pushed to branch 'main'", summary: "Refactored UI components for global consistency", time: "2:20 PM", color: "blue" },
            { source: "Drive", title: "Document 'Technical Roadmap' analyzed", summary: "Extracted 12 new knowledge fragments", time: "2:15 PM", color: "emerald" },
            { source: "Telegram", title: "Message batch processed", summary: "Extracted context from #development channel", time: "2:10 PM", color: "purple" },
          ]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchActivity();
    const interval = setInterval(fetchActivity, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check if the script is already loaded
    if (typeof window !== "undefined" && (window as any).Globe) {
      initializeGlobe();
    }
  }, []);

  const initializeGlobe = () => {
    // Gen random data with modern colors
    const N = 24;
    const colors = ["#6366f1", "#a855f7", "#ec4899", "#3b82f6", "#10b981"];
    const arcsData = Array.from({ length: N }, () => ({
      startLat: (Math.random() - 0.5) * 180,
      startLng: (Math.random() - 0.5) * 360,
      endLat: (Math.random() - 0.5) * 180,
      endLng: (Math.random() - 0.5) * 360,
      color: [
        colors[Math.floor(Math.random() * colors.length)],
        colors[Math.floor(Math.random() * colors.length)],
      ],
    }));

    if (typeof window !== "undefined" && (window as any).Globe) {
      const globeElement = document.getElementById("globeViz");
      if (globeElement) {
        // Clear previous instance if any (though Globe.gl usually appends)
        globeElement.innerHTML = '';

        new (window as any).Globe(globeElement)
          .globeImageUrl(
            "//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
          )
          .backgroundColor("rgba(0,0,0,0)")
          .arcsData(arcsData)
          .arcColor("color")
          .arcDashLength(() => 0.4)
          .arcDashGap(() => 0.1)
          .arcDashAnimateTime(() => Math.random() * 3000 + 1000)
          .arcStroke(0.5)
          .atmosphereColor("#6366f1")
          .atmosphereAltitude(0.15);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Script src="//cdn.jsdelivr.net/npm/globe.gl" onLoad={initializeGlobe} />

      <header className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-white">Live Operations</h2>
        <p className="text-zinc-400">
          Real-time visualization of data ingestion and intelligence mapping across global nodes.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 relative glass-card rounded-3xl overflow-hidden h-[600px] flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
          <div id="globeViz" className="w-full h-full cursor-grab active:cursor-grabbing"></div>
          <div className="absolute bottom-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg border border-zinc-800/50">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-300">Live Telemetry Active</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl h-full border-zinc-800/30">
            <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
            <div className="space-y-6">
              {updates.map((update, i) => {
                const colorMap = {
                  blue: { bg: "bg-blue-500", text: "text-blue-500", border: "hover:border-blue-500/50" },
                  emerald: { bg: "bg-emerald-500", text: "text-emerald-500", border: "hover:border-emerald-500/50" },
                  purple: { bg: "bg-purple-500", text: "text-purple-500", border: "hover:border-purple-500/50" },
                };
                const colors = colorMap[update.color as keyof typeof colorMap] || colorMap.blue;

                return (
                  <div key={i} className={`group relative pl-6 border-l border-zinc-800 ${colors.border} transition-colors`}>
                    <div className={`absolute left-[-4.5px] top-1 w-2 h-2 rounded-full ${colors.bg} group-hover:scale-125 transition-transform`} />
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`material-symbols-outlined text-xs ${colors.text}`}>{update.source === "Drive" ? "add_to_drive" : update.source === "GitHub" ? "terminal" : "send"}</span>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${colors.text}`}>{update.source}</p>
                    </div>
                    <p className="text-sm font-semibold text-zinc-200 mb-1 leading-tight">{update.title}</p>
                    <p className="text-xs text-zinc-500 mb-2 line-clamp-2">{update.summary}</p>
                    <p className="text-[10px] font-medium text-zinc-600 uppercase">{update.time} • UTC-5</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-8">
              <button className="btn-secondary w-full py-2.5 text-xs uppercase tracking-widest font-bold opacity-50 hover:opacity-100 transition-opacity">
                View Full Logs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
