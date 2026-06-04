"use client"

import Sidebar from "../Sidebar"

export default function SettingsPage() {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-black text-white p-10">
        <div className="mb-8">
          <a
            href="/dashboard"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10"
          >
            ← Dashboard
          </a>
        </div>

        <h1 className="text-5xl font-bold text-green-500 mb-8">Settings</h1>

        <div className="bg-zinc-900 p-6 rounded-2xl max-w-3xl">
          <p className="text-zinc-400">Paramètres bientôt disponibles</p>
        </div>
      </main>
    </div>
  )
}
