const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api/v1';

export function FoundationHomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-4 px-4 py-12">
      <p className="text-sm font-medium tracking-wide text-slate-600 uppercase">LibFind</p>
      <h1 className="text-3xl font-semibold text-slate-900">Foundations online</h1>
      <p className="max-w-prose text-base leading-relaxed text-slate-700">
        Phase 0 bootstrap shell. Product discovery, listings, and marketplace workflows are not
        implemented yet.
      </p>
      <p className="text-sm text-slate-500">
        API base: <code className="rounded bg-slate-100 px-1.5 py-0.5">{apiBase}</code>
      </p>
    </main>
  );
}
