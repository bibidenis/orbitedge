"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Sidebar from "../Sidebar"
import { supabase } from "@/lib/supabase"

export default function StrategyPage() {
  const params = useParams()
  const router = useRouter()
  const strategyId = Number(params.strategy)

  const [strategy, setStrategy] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [tradesHistory, setTradesHistory] = useState<any[]>([])
  const [match, setMatch] = useState("")
  const [odds, setOdds] = useState("")
  const [stake, setStake] = useState("")
  const [bookmaker, setBookmaker] = useState("")

  async function loadStrategy() {
    const { data: { session }, error: sessionError } =
      await supabase.auth.getSession()

    if (sessionError || !session) {
      router.replace("/auth")
      return
    }

    const userId = session.user.id

    const { data, error } = await supabase
      .from("strategies")
      .select("*")
      .eq("id", strategyId)
      .eq("user_id", userId)
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

  async function saveStrategyEdits() {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      router.replace('/auth')
      return
    }

    const { error, data: updated } = await supabase
      .from('strategies')
      .update({ name: editName, description: editDescription })
      .eq('id', strategyId)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error(error)
      alert('Erreur lors de la mise à jour')
      return
    }

    setStrategy(updated)
    setEditing(false)
  }

  async function deleteStrategy() {
    if (!confirm('Supprimer cette stratégie ? Cette action est irréversible.')) return
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      router.replace('/auth')
      return
    }

    const { error } = await supabase.from('strategies').delete().eq('id', strategyId).eq('user_id', session.user.id)
    if (error) {
      console.error(error)
      alert('Erreur lors de la suppression')
      return
    }

    router.replace('/dashboard')
  }

  async function updateStats(type: "win" | "loss") {
    const { data: { session }, error: sessionError } =
      await supabase.auth.getSession()

    if (sessionError || !session) {
      alert("Connecte-toi pour ajouter un trade")
      router.replace("/auth")
      return
    }

    const userId = session.user.id
    const profitValue =
      type === "win"
        ? (Number(odds) - 1) * Number(stake)
        : -Number(stake)

    const { error } = await supabase.from("trades").insert([
      {
        strategy_id: strategyId,
        user_id: userId,
        match,
        bookmaker,
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
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session) {
    router.replace('/auth')
    return
  }

  const { error } = await supabase
    .from("trades")
    .delete()
    .eq("id", id)
    .eq('user_id', session.user.id)

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
      <div className="mb-8">
        <a
          href="/dashboard"
          className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10"
        >
          ← Dashboard
        </a>
      </div>
      <div className="mb-6 flex items-center justify-between">
        {editing ? (
          <div className="flex-1">
            <input className="w-full bg-black border border-zinc-700 p-3 rounded-xl mb-2" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <input className="w-full bg-black border border-zinc-700 p-3 rounded-xl mb-2" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={saveStrategyEdits} className="rounded-xl bg-green-500 px-4 py-2 text-black font-bold">Save</button>
              <button onClick={() => setEditing(false)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-5xl font-bold text-green-500">{strategy.name}</h1>
            <div className="flex gap-3">
              <button onClick={() => {
                setEditing(true)
                setEditName(strategy.name || '')
                setEditDescription(strategy.description || '')
              }} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200">Edit</button>

              <button onClick={deleteStrategy} className="rounded-xl bg-red-600 px-4 py-2 text-white">Delete</button>
            </div>
          </>
        )}
      </div>

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

      {tradesHistory.length === 0 ? (
        <p className="text-zinc-400">Aucun trade enregistré pour cette stratégie.</p>
      ) : (
        tradesHistory.map((trade) => (
          <div key={trade.id} className="bg-zinc-900 p-4 rounded-xl mb-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <span className="text-zinc-400 text-sm">
                Date : {trade.created_at ? new Date(trade.created_at).toLocaleString() : trade.date ?? 'N/A'}
              </span>
              <span
                className={`font-bold ${trade.result === 'WIN' ? 'text-green-500' : 'text-red-500'}`}
              >
                {trade.result}
              </span>
            </div>

            <h3 className="text-xl font-semibold text-green-400 mb-1">
              {trade.match || 'Match non renseigné'}
            </h3>
            <p className="text-zinc-400 mb-3">Bookmaker : {trade.bookmaker || 'N/A'}</p>

            <div className="grid grid-cols-2 gap-4 text-sm text-zinc-300 mb-4">
              <div className="space-y-1">
                <p className="text-zinc-400">Cote</p>
                <p>{trade.odds ?? 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-400">Stake</p>
                <p>{trade.stake ?? 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-400">Profit</p>
                <p className={trade.profit >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {Number(trade.profit || 0).toFixed(2)}u
                </p>
              </div>
            </div>

            <button
              onClick={() => deleteTrade(trade.id)}
              className="bg-red-600 text-white px-3 py-1 rounded-lg"
            >
              Delete
            </button>
          </div>
        ))
      )}
    </main>
  )
}