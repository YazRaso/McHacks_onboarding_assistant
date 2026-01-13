"use client";

import React, { useState } from "react";

export default function QueryInterface() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!prompt.trim()) return;
    const userMsg = { role: "user" as const, text: prompt };
    setMessages((m) => [...m, userMsg]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, source: "vscode-extension" }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", text: data.reply ?? JSON.stringify(data) },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Error contacting API" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[60vh] bg-white p-4 rounded shadow">
      <div className="flex-1 overflow-auto p-2 space-y-3">
        {messages.length === 0 && (
          <div className="text-sm text-slate-500">
            No messages yet. Ask the LLM Memory something.
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded ${
              m.role === "user"
                ? "bg-blue-50 self-end text-right"
                : "bg-slate-100"
            }`}
          >
            <div className="text-sm">{m.text}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={send}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
}
