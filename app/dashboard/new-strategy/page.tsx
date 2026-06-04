"use client"

import { useState } from "react"
import { supabase } from "../../../lib/supabase"

export default function NewStrategyPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  async function handleSave() {
    if (!name.trim()) {
  alert("Entre un nom de stratégie")
  return
}
    const { error } = await supabase.from("strategies").insert([
      {
        name,
        bankroll: 0,
        trades: 0,
        winrate: 0,
        roi: 0,
        profit: 0,
      },
    ])

    if (error) {
  console.error(error)
  alert(JSON.stringify(error))
  return
}
    alert("Stratégie enregistrée dans Supabase !")
    setName("")
    setDescription("")
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-5xl font-bold text-green-500 mb-8">
        New Strategy
      </h1>

      <div className="bg-zinc-900 p-6 rounded-2xl max-w-xl space-y-4">
        <input
          className="w-full bg-black border border-zinc-700 p-3 rounded"
          placeholder="Strategy name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          className="w-full bg-black border border-zinc-700 p-3 rounded"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          onClick={handleSave}
          className="bg-green-500 text-black font-bold px-6 py-3 rounded-xl"
        >
          Save Strategy
        </button>
      </div>
    </main>
  )
}