import {
  APPLICATION_STATUSES,
  APPLICATION_TRANSITIONS,
  allowedTransitions,
} from '@imp/contracts';

// Halaman ini sengaja membaca enum dan tabel transisi dari @imp/contracts --
// paket yang sama dengan yang dipakai backend untuk menolak transisi tidak sah.
// Jadi kalau aturannya berubah, halaman ini ikut berubah tanpa disunting.
export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Tahap 0 — fondasi
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Internship Management Platform
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Lowongan → lamaran → penugasan → laporan mingguan → evaluasi.
          Rencana kerjanya ada di <code>docs/roadmap-4-minggu.md</code>.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Status lamaran &amp; transisi sah</h2>
        <ul className="flex flex-col gap-2">
          {APPLICATION_STATUSES.map((status) => {
            const targets = allowedTransitions(APPLICATION_TRANSITIONS, status);
            return (
              <li
                key={status}
                className="flex flex-wrap items-baseline gap-2 rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800"
              >
                <span className="font-mono text-sm font-medium">{status}</span>
                <span className="text-slate-400" aria-hidden="true">
                  →
                </span>
                <span className="font-mono text-sm text-slate-600 dark:text-slate-300">
                  {targets.length > 0 ? targets.join(', ') : 'status akhir'}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
