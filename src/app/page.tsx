import Link from "next/link";
import { getOptionalUser } from "@/lib/session";

const FEATURES = [
  { title: "Markdown notes", desc: "Fast markdown editing with live preview and Obsidian-style [[backlinks]]." },
  { title: "AI companion", desc: "Bring your own API key. Chat with your notes, refine selections, and get auto-reviews." },
  { title: "Daily digest", desc: "Every morning, an AI-written recap of yesterday and a focus plan for today." },
  { title: "Pomodoro focus", desc: "A calm timer with session logs and weekly stats, right inside your notes." },
  { title: "Knowledge graph", desc: "Watch your ideas connect as notes grow into a web of linked thought." },
  { title: "Your data, yours", desc: "Export or import everything as plain markdown. No lock-in." },
];

export default async function LandingPage() {
  const user = await getOptionalUser();
  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <header className="mb-16 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-neutral-400">Grill</p>
        <h1 className="mx-auto mb-6 max-w-2xl text-4xl font-semibold leading-tight md:text-6xl">
          Notes that remember,<br />focus that compounds.
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-lg text-neutral-500">
          Markdown notes, backlinks, an AI that reviews your thinking, and a Pomodoro timer — in one calm workspace.
        </p>
        <Link href={user ? "/app/notes" : "/register"} className="rounded-full bg-neutral-900 px-6 py-3 text-white transition hover:opacity-90 dark:bg-neutral-100 dark:text-black">
          {user ? "Open your workspace" : "Start for free"}
        </Link>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-1 font-medium">{f.title}</h2>
            <p className="text-sm text-neutral-500">{f.desc}</p>
          </div>
        ))}
      </section>
      <footer className="mt-20 text-center text-xs text-neutral-400">Built with Grill · markdown in, markdown out.</footer>
    </main>
  );
}
