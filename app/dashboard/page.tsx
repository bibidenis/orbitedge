"use client"

import { useEffect, useState } from "react"
import Sidebar from "./Sidebar"
import { supabase } from "@/lib/supabase"
export default function DashboardPage() {
  const [strategies, setStrategies] = useState<any[]>([])
const [profit, setProfit] = useState(0)
const [roi, setRoi] = useState(0)
const [trades, setTrades] = useState(0)
const [bankroll, setBankroll] = useState(0)
const [winRate, setWinRate] = useState(0)
 useEffect(() => {
  async function loadDashboard() {
    const { data: strategiesData, error: strategiesError } = await supabase
      .from("strategies")
      .select("*")

    if (strategiesError) {
      console.error(strategiesError)
      return
    }

    const { data: tradesData, error: tradesError } = await supabase
      .from("trades")
      .select("*")

    if (tradesError) {
      console.error(tradesError)
      return
    }

    const totalProfit = (tradesData || []).reduce(
      (sum, trade) => sum + Number(trade.profit || 0),
      0
    )

    const totalTrades = tradesData?.length || 0

    const wins = (tradesData || []).filter(
      (trade) => trade.result === "WIN"
    ).length
    const bankroll = 100 + totalProfit
    setStrategies(strategiesData || [])
    setProfit(totalProfit)
    setTrades(totalTrades)
    setBankroll(bankroll)
    setWinRate(totalTrades > 0 ? (wins / totalTrades) * 100 : 0)
    setRoi(totalTrades > 0 ? totalProfit / totalTrades : 0)
  }

  loadDashboard()
}, [])
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-black text-white p-8">
        <h1 className="text-5xl font-bold text-green-500 mb-8">
          OrbitEdge Dashboard
        </h1>

        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-zinc-900 p-6 rounded-2xl">
            <p className="text-zinc-400">Total Profit</p>
            <h2 className="text-3xl font-bold text-green-400">+{profit}u</h2>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <p className="text-zinc-400">ROI</p>
            <h2 className="text-3xl font-bold text-green-400">{roi}%</h2>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <p className="text-zinc-400">Trades</p>
            <h2 className="text-3xl font-bold">{trades}</h2>
          </div>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl">
  <p className="text-zinc-400">Bankroll</p>
  <h2 className="text-3xl font-bold text-green-500">
    {bankroll.toFixed(2)}u
  </h2>
</div>

<div className="bg-zinc-900 p-6 rounded-2xl">
  <p className="text-zinc-400">Win Rate</p>
  <h2 className="text-3xl font-bold text-green-500">
    {winRate.toFixed(1)}%
  </h2>
</div>

<div className="bg-zinc-900 p-6 rounded-2xl">
  <p className="text-zinc-400">Strategies</p>
  <h2 className="text-3xl font-bold text-green-500">
    {strategies.length}
  </h2>
</div>

        <div className="bg-zinc-900 p-6 rounded-2xl">
          <h3 className="text-2xl font-bold mb-4">Strategies</h3>
               <div className="space-y-4">
  {strategies.length === 0 ? (
    <p className="text-zinc-400">
      No strategy created yet.
    </p>
  ) : (
    strategies.map((strategy) => (
      <div
        key={strategy.id}
        className="bg-black p-4 rounded-xl"
      >
        <a
  href={`/dashboard/${strategy.id}`}
  className="text-green-400 hover:text-green-300"
>
  <div>
  <h4 className="text-green-400 font-bold">
    {strategy.name}
  </h4>

  <p className="text-zinc-400 text-sm">
  ID: {strategy.id}
</p>
</div>
</a>
<button
  onClick={() => {
    const updated = strategies.filter((s) => s.id !== strategy.id)
    setStrategies(updated)
    localStorage.setItem("strategies", JSON.stringify(updated))
  }}
  className="text-red-400 hover:text-red-300"
>
  Delete
</button>
      </div>
    ))
  )}
</div>
        </div>
      </main>
    </div>
  )
}