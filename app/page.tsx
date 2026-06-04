export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight">
            Orbit<span className="text-emerald-400">Edge</span>
          </div>
          <a
            href="/auth"
            className="rounded-full border border-white/10 px-5 py-2 text-sm text-zinc-300 hover:bg-white/10"
          >
            Sign in
          </a>
        </nav>

        <div className="grid flex-1 items-center gap-12 py-20 lg:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
              Built for sports exchange traders
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-tight md:text-7xl">
              Understand every trade.
              <span className="block text-emerald-400">
                Master your edge.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
              Import OrbitX exports, group BACK/LAY trades, detect hedges,
              analyse strategies and track your real trading performance.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
  href="/dashboard"
  className="rounded-2xl bg-emerald-400 px-7 py-4 font-bold text-black hover:bg-emerald-300"
>
  Launch Dashboard
</a>
              <button className="rounded-2xl border border-white/10 px-7 py-4 font-bold text-white hover:bg-white/10">
                View Demo
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-zinc-400">Live Strategy Analytics</p>
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                OrbitX Ready
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card title="Net Profit" value="+364.72u" positive />
              <Card title="ROI" value="5.98%" positive />
              <Card title="Trades" value="86" />
              <Card title="Drawdown" value="-68.80u" />
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-semibold">Top Strategies</p>
                <p className="text-sm text-zinc-500">Last import</p>
              </div>

              <Strategy name="Lay The Draw" profit="+364.72u" roi="5.98%" />
              <Strategy name="Asian Handicap" profit="+128.40u" roi="7.21%" />
              <Strategy name="Lay Under 2MT" profit="+52.10u" roi="4.80%" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Card({
  title,
  value,
  positive,
}: {
  title: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className={positive ? "mt-2 text-2xl font-bold text-emerald-400" : "mt-2 text-2xl font-bold"}>
        {value}
      </p>
    </div>
  );
}

function Strategy({
  name,
  profit,
  roi,
}: {
  name: string;
  profit: string;
  roi: string;
}) {
  return (
    <div className="flex items-center justify-between border-t border-white/10 py-4">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-zinc-500">Grouped trade analytics</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-emerald-400">{profit}</p>
        <p className="text-sm text-zinc-500">{roi} ROI</p>
      </div>
    </div>
  );
}