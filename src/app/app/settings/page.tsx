"use client";
import { useEffect, useState } from "react";
import { DEFAULT_MODELS } from "@/lib/ai";

export default function SettingsPage() {
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState(DEFAULT_MODELS.openai);
  const [apiKey, setApiKey] = useState("");
  const [configured, setConfigured] = useState(false);
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/ai/settings").then((r) => r.json()).then((s) => {
      setProvider(s.provider); setModel(s.model); setConfigured(s.configured);
    });
  }, []);

  async function save() {
    const res = await fetch("/api/ai/settings", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ provider, model, ...(apiKey ? { apiKey } : {}) }) });
    setMsg(res.ok ? "Saved. Your key is encrypted server-side." : "Save failed.");
  }

  async function test() {
    setTesting(true); setMsg("");
    const res = await fetch("/api/ai/test", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ provider, model, apiKey }) });
    const r = await res.json();
    setMsg(r.ok ? "Connection OK." : `Failed: ${r.error ?? "unknown"}`);
    setTesting(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <section className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="font-medium">AI</h2>
        <select value={provider} onChange={(e) => { setProvider(e.target.value); setModel(DEFAULT_MODELS[e.target.value as keyof typeof DEFAULT_MODELS] ?? ""); }} className="w-full rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700">
          {Object.keys(DEFAULT_MODELS).map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model id" className="w-full rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700" />
        <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={configured ? "New API key (leave blank to keep current)" : "API key"} className="w-full rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700" />
        <div className="flex gap-2">
          <button onClick={save} className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white dark:bg-neutral-100 dark:text-black">Save</button>
          <button onClick={test} disabled={testing} className="rounded-md border px-4 py-2 text-sm disabled:opacity-50">Test connection</button>
        </div>
        {msg && <p className="text-sm text-neutral-500">{msg}</p>}
        <p className="text-xs text-neutral-400">Keys never leave the server. Bring your own provider key.</p>
      </section>
      <section className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="font-medium">Data</h2>
        <a href="/api/export" className="inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm text-white dark:bg-neutral-100 dark:text-black">Export all notes (.zip)</a>
        <label className="block text-sm">
          Import .zip of markdown files
          <input type="file" accept=".zip" className="mt-1 block w-full text-sm" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const form = new FormData();
            form.append("file", f);
            const res = await fetch("/api/import", { method: "POST", body: form });
            const r = await res.json();
            alert(`Imported ${r.count ?? 0} notes.`);
            e.target.value = "";
          }} />
        </label>
      </section>
    </div>
  );
}
