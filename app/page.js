export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-2xl flex-col items-center justify-center text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
          Telegram Mini App MVP
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">SOIA Protein Shop</h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">
          A lightweight foundation for a premium protein shop experience inside Telegram.
        </p>
      </section>
    </main>
  );
}
