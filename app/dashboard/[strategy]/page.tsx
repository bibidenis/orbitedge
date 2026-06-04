"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function StrategyPage() {
  const params = useParams()
  const strategyId = Number(params.strategy)

  const [strategy, setStrategy] = useState<any>(null)
  const [tradesHistory, setTradesHistory] = useState<any[]>([])
  const [match, setMatch] = useState("")
  const [odds, setOdds] = useState("")
  const [stake, setStake] = useState("")
  const [bookmaker, setBookmaker] = useState("")

  async function loadStrategy() {
    const { data, error } = await supabase
      .from("strategies")
      .select("*")
      .eq("id", strategyId)
      .single()

    if (error) {
      console.error(error)
      return
    }

    setStrategy(data)

    const { data: trades } = await supabase
      .from("trades")
      .select("*")
      .eq("strategy_id", strategyId)
      .order("created_at", { ascending: false })

    setTradesHistory(trades || [])
  }

  useEffect(() => {
    loadStrategy()
  }, [strategyId])

  async function updateStats(type: "win" | "loss") {
    const profitValue =
      type === "win"
        ? (Number(odds) - 1) * Number(stake)
        : -Number(stake)

    const { error } = await supabase.from("trades").insert([
      {
        strategy_id: strategyId,
        odds: Number(odds),
        stake: Number(stake),
        result: type === "win" ? "WIN" : "LOSS",
        profit: profitValue,
      },
    ])

    if (error) {
      console.error(error)
      alert(JSON.stringify(error))
      return
    }

    setMatch("")
    setOdds("")
    setStake("")
    setBookmaker("")
    await loadStrategy()
  }
async function deleteTrade(id: number) {
  const { error } = await supabase
    .from("trades")
    .delete()
    .eq("id", id)

  if (error) {
    console.error(error)
    alert(JSON.stringify(error))
    return
  }

  await loadStrategy()
}
  if (!strategy) {
    return <main className="min-h-screen bg-black text-white p-10">Strategy not found</main>
  }

  const profit = tradesHistory.reduce(
  (total, trade) => total + Number(trade.profit || 0),
  0
)

const trades = tradesHistory.length

const wins = tradesHistory.filter(
  (trade) => trade.result === "WIN"
).length

const losses = tradesHistory.filter(
  (trade) => trade.result === "LOSS"
).length

const winRate =
  trades > 0 ? ((wins / trades) * 100).toFixed(1) : "0"

const roi =
  trades > 0 ? (profit / trades).toFixed(2) : "0"
  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-5xl font-bold text-green-500 mb-8">{strategy.name}</h1>

      <div className="bg-zinc-900 p-6 rounded-2xl mb-8">
        <h2 className="text-2xl font-bold mb-4">Statistiques de la stratégie</h2>
        <p>Profit : {profit.toFixed(2)}u</p>
        <p>ROI : {roi}%</p>
        <p>Trades : {trades}</p>
        <p>Wins : {wins}</p>
        <p>Losses : {losses}</p>
        <p>Win Rate : {winRate}%</p>
      </div>

      <div className="space-y-4 mb-8">
        <input className="w-full bg-black border border-zinc-700 p-3 rounded-xl" placeholder="Match ex: Malmö vs AIK" value={match} onChange={(e) => setMatch(e.target.value)} />
        <input className="w-full bg-black border border-zinc-700 p-3 rounded-xl" placeholder="Cote ex: 1.85" value={odds} onChange={(e) => setOdds(e.target.value)} />
        <input className="w-full bg-black border border-zinc-700 p-3 rounded-xl" placeholder="Stake ex: 5" value={stake} onChange={(e) => setStake(e.target.value)} />
        <input className="w-full bg-black border border-zinc-700 p-3 rounded-xl" placeholder="Bookmaker ex: Betfair" value={bookmaker} onChange={(e) => setBookmaker(e.target.value)} />

        <button onClick={() => updateStats("win")} className="bg-green-500 text-black font-bold px-6 py-3 rounded-xl mr-4">
          Add Win
        </button>

        <button onClick={() => updateStats("loss")} className="bg-red-500 text-white font-bold px-6 py-3 rounded-xl">
          Add Loss
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-4">Historique des trades</h2>

      {tradesHistory.map((trade) => (
        <div key={trade.id} className="bg-zinc-900 p-4 rounded-xl mb-3">
          <p>Résultat : {trade.result}</p>
          <p>Cote : {trade.odds}</p>
          <p>Stake : {trade.stake}</p>
          <p>Profit : {Number(trade.profit).toFixed(2)}u</p>
          <button
            onClick={() => deleteTrade(trade.id)}
            className="bg-red-600 text-white px-3 py-1 rounded-lg mt-2"
>
  Delete
</button>
        </div>
      ))}
    </main>
  )
}