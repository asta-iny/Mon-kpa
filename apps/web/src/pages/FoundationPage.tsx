const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api/v1';

export function FoundationPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
      <div className="mx-auto max-w-xl">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">LibFind</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Foundation shell</h1>
        <p className="mt-3 text-slate-300">
          Phase 0 bootstrap only. Product discovery workflows are not implemented yet.
        </p>
        <p className="mt-6 font-mono text-sm text-slate-400">API base: {apiBase}</p>
      </div>
    </main>
  );
}
