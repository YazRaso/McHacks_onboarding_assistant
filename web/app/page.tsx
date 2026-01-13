import Link from "next/link";

export default function Home() {
  const hasKey = !!process.env.BACKBOARD_API_KEY;

  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-4">Backboard Dashboard</h1>
      <p className="text-slate-600 mb-6">
        Welcome — this dashboard visualizes Backboard LLM Memory and connected
        sources.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Link
          href="/memory"
          className="p-4 bg-white rounded shadow hover:shadow-md"
        >
          <h3 className="font-semibold">Memory Overview</h3>
          <p className="text-sm text-slate-500 mt-2">
            View connected sources and activity logs.
          </p>
        </Link>

        <Link
          href="/connected"
          className="p-4 bg-white rounded shadow hover:shadow-md"
        >
          <h3 className="font-semibold">Connected Apps</h3>
          <p className="text-sm text-slate-500 mt-2">
            Manage Drive, Telegram and demo repo toggles.
          </p>
        </Link>

        <Link
          href="/query"
          className="p-4 bg-white rounded shadow hover:shadow-md"
        >
          <h3 className="font-semibold">Query LLM Memory</h3>
          <p className="text-sm text-slate-500 mt-2">
            Chat-like interface to query the Backboard LLM Memory.
          </p>
        </Link>

        <Link
          href="/settings"
          className="p-4 bg-white rounded shadow hover:shadow-md"
        >
          <h3 className="font-semibold">API Settings</h3>
          <p className="text-sm text-slate-500 mt-2">
            Configure your Backboard API key and demo options.
          </p>
        </Link>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h4 className="font-medium">Environment</h4>
        <p className="text-sm text-slate-600 mt-2">
          Backboard API Key configured on server:{" "}
          <strong>{hasKey ? "Yes" : "No"}</strong>
        </p>
        <p className="text-sm text-slate-500 mt-2">
          Note: in local dev, set <code>BACKBOARD_API_KEY</code> in{" "}
          <code>.env.local</code> or in Vercel env vars.
        </p>
      </div>
    </div>
  );
}
