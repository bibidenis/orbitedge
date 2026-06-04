export default function Sidebar() {
  return (
    <aside className="min-h-screen w-64 border-r border-white/10 bg-black p-6 text-white">
      <h1 className="text-3xl font-bold text-green-500">
        OrbitEdge
      </h1>

      <nav className="mt-10 flex flex-col gap-4">
        <a href="/dashboard" className="text-zinc-300 hover:text-green-400">
          Dashboard
        </a>

        <a href="#" className="text-zinc-300 hover:text-green-400">
          Trades
        </a>

        <a href="#" className="text-zinc-300 hover:text-green-400">
          Strategies
        </a>
<a href="/dashboard/new-strategy" className="text-zinc-300 hover:text-green-500">
  New Strategy
</a>
        <a href="#" className="text-zinc-300 hover:text-green-400">
          Analytics
        </a>

        <a href="#" className="text-zinc-300 hover:text-green-400">
          Settings
        </a>
      </nav>
    </aside>
  );
}