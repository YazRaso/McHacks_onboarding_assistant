import QueryInterface from "../../components/QueryInterface";

export default function QueryPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Query LLM Memory</h2>
      <p className="text-sm text-slate-600 mb-4">
        Ask the Backboard LLM Memory. This endpoint is used by the VSCode Buddy
        extension via `/api/vscode` or `/api/query`.
      </p>

      <QueryInterface />
    </div>
  );
}
