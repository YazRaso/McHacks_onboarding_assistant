export default function SettingsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold">API Settings</h2>
      <div className="mt-4 bg-white p-4 rounded shadow space-y-2">
        <p className="text-sm text-slate-600">
          Set your Backboard API key in Vercel or in a local `.env.local` file
          as <code>BACKBOARD_API_KEY</code>. The web app will read it from{" "}
          <code>process.env.BACKBOARD_API_KEY</code>.
        </p>

        <div className="pt-2">
          <label className="block text-sm font-medium text-slate-700">
            Demo / Local Setup
          </label>
          <div className="mt-2 text-sm text-slate-600">
            Create a <code>.env.local</code> file in the root with:
          </div>
          <pre className="bg-slate-100 p-2 rounded text-sm mt-2">
            BACKBOARD_API_KEY=your_api_key_here
          </pre>
        </div>
      </div>
    </div>
  );
}
