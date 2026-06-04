"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "./Sidebar"
import { supabase } from "@/lib/supabase"

export default function DashboardPage() {
  const [strategies, setStrategies] = useState<any[]>([])
  const [profit, setProfit] = useState(0)
  const [roi, setRoi] = useState(0)
  const [trades, setTrades] = useState(0)
  const [bankroll, setBankroll] = useState(0)
  const [winRate, setWinRate] = useState(0)
  const [loading, setLoading] = useState(true)
  const [editingStrategyId, setEditingStrategyId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        router.replace("/auth")
        return
      }

      const userId = session.user.id

      const { data: strategiesData, error: strategiesError } = await supabase
        .from("strategies")
        .select("*")
        .eq("user_id", userId)

      if (strategiesError) {
        console.error(strategiesError)
        setLoading(false)
        return
      }

      const strategyIds = (strategiesData || []).map((strategy) => strategy.id)

      const { data: tradesData, error: tradesError } = strategyIds.length
        ? await supabase
            .from("trades")
            .select("*")
            .in("strategy_id", strategyIds)
        : { data: [] }

      if (tradesError) {
        console.error(tradesError)
        setLoading(false)
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
      const currentBankroll = 100 + totalProfit

      setStrategies(strategiesData || [])
      setProfit(totalProfit)
      setTrades(totalTrades)
      setBankroll(currentBankroll)
      setWinRate(totalTrades > 0 ? (wins / totalTrades) * 100 : 0)
      setRoi(totalTrades > 0 ? totalProfit / totalTrades : 0)
      setLoading(false)
    }

    loadDashboard()
  }, [router])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace("/auth")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-400">Chargement du dashboard...</p>
      </div>
    )
  }

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-black text-white p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold text-green-500">
              OrbitEdge Dashboard
            </h1>
            <p className="text-zinc-400">
              Aperçu des stratégies et statistiques personnelles.
            </p>
          </div>

          <button
            onClick={handleSignOut}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white hover:bg-white/10"
          >
            Sign Out
          </button>
        </div>

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
        {editingStrategyId === strategy.id ? (
          <div>
            <input
              className="w-full bg-black border border-zinc-700 p-3 rounded-xl mb-2"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Strategy name"
            />
            <input
              className="w-full bg-black border border-zinc-700 p-3 rounded-xl mb-2"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description"
            />
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  // save
                  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
                  if (sessionError || !session) {
                    router.replace('/auth')
                    return
                  }
                  const { error, data: updated } = await supabase
                    .from('strategies')
                    .update({ name: editName, description: editDescription })
                    .eq('id', strategy.id)
                    .eq('user_id', session.user.id)
                    .select()
                    .single()

                  if (error) {
                    console.error("Update strategy error:", error)
                    alert(JSON.stringify(error, null, 2))
                    return
                  }

                  setStrategies((prev) => prev.map((s) => (s.id === strategy.id ? updated : s)))
                  setEditingStrategyId(null)
                }}
                className="rounded-xl bg-green-500 px-4 py-2 text-black font-bold"
              >
                Save
              </button>

              <button
                onClick={() => setEditingStrategyId(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <a href={`/dashboard/${strategy.id}`} className="text-green-400 hover:text-green-300">
              <div>
                <h4 className="text-green-400 font-bold">{strategy.name}</h4>
                <p className="text-zinc-400 text-sm">ID: {strategy.id}</p>
              </div>
            </a>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingStrategyId(strategy.id)
                  setEditName(strategy.name || '')
                  setEditDescription(strategy.description || '')
                }}
                className="text-zinc-200 hover:text-green-300"
              >
                Edit
              </button>

              <button
                onClick={async () => {
                  if (!confirm('Supprimer cette stratégie ? Cette action est irréversible.')) return
                  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
                  if (sessionError || !session) {
                    router.replace('/auth')
                    return
                  }

                  const { error } = await supabase.from('strategies').delete().eq('id', strategy.id).eq('user_id', session.user.id)
                  if (error) {
                    console.error(error)
                    alert('Erreur lors de la suppression')
                    return
                  }

                  setStrategies((prev) => prev.filter((s) => s.id !== strategy.id))
                }}
                className="text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    ))
  )}
</div>
        </div>
      </main>
    </div>
  )
}