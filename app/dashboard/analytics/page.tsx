"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "../Sidebar"
import { supabase } from "@/lib/supabase"
import { formatPercent, formatUnits } from "@/lib/format"

export default function AnalyticsPage() {
  const [trades, setTrades] = useState<any[]>([])
  const [initialBankroll, setInitialBankroll] = useState(100)
  const router = useRouter()

  useEffect(() => {
    async function loadAnalytics() {
      const { data: { session }, error: sessionError } =
        await supabase.auth.getSession()

      if (sessionError || !session) {
        router.replace("/auth")
        return
      }

      const { data: strategies, error: strategiesError } = await supabase
        .from("strategies")
        .select("id")
        .eq("user_id", session.user.id)

      if (strategiesError) {
        console.error(strategiesError)
        return
      }

      const strategyIds = (strategies || []).map((strategy) => strategy.id)

      const { data, error } = strategyIds.length
        ? await supabase
            .from("trades")
            .select("*")
            .in("strategy_id", strategyIds)
            .order("created_at", { ascending: true })
        : { data: [] }

      if (error) {
        console.error(error)
        return
      }

      setTrades(data || [])
    }

    loadAnalytics()
  }, [router])

  const totalTrades = trades.length

  const wins = trades.filter((trade) => trade.result === "WIN").length
  const losses = trades.filter((trade) => trade.result === "LOSS").length

  const bestWin =
    trades.length > 0
      ? Math.max(...trades.map((trade) => Number(trade.profit || 0)))
      : 0

  const worstLoss =
    trades.filter((trade) => Number(trade.profit || 0) < 0).length > 0
      ? Math.min(...trades.map((trade) => Number(trade.profit || 0)))
      : 0

  let bankroll = initialBankroll
  let cumulativeProfit = 0
  let cumulativeStake = 0
  let winsCount = 0

  const analyticsData = trades.map((trade, index) => {
    const profit = Number(trade.profit || 0)
    const stakeValue = Number(trade.stake || 0)
    cumulativeProfit += profit
    cumulativeStake += stakeValue
    if (trade.result === "WIN") {
      winsCount += 1
    }

    bankroll += profit

    return {
      trade: index + 1,
      label: `Trade ${index + 1}`,
      cumulativeProfit,
      avgRoi:
        cumulativeStake > 0 ? (cumulativeProfit / cumulativeStake) * 100 : 0,
      winRate:
        index >= 0 ? (winsCount / (index + 1)) * 100 : 0,
    }
  })

  // Use the last point from analyticsData as the single source of truth for cards
  const lastPoint =
    analyticsData.length > 0
      ? analyticsData[analyticsData.length - 1]
      : {
          bankroll: initialBankroll,
          cumulativeProfit: 0,
          avgRoi: 0,
          winRate: 0,
        }
  const currentBankroll = lastPoint?.bankroll ?? initialBankroll
  const totalProfit = lastPoint?.cumulativeProfit ?? 0
  const averageRoi = lastPoint?.avgRoi ?? 0
  const winRate = lastPoint?.winRate ?? 0
  const pieData = [
    { name: "Wins", value: wins },
    { name: "Losses", value: losses },
  ]

  const exportCSV = () => {
    const headers = ["Odds", "Stake", "Result", "Profit"]

    const rows = trades.map((trade) => [
      trade.odds || "",
      trade.stake || "",
      trade.result || "",
      trade.profit || "",
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    })

    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "orbitedge-trades.csv"
    link.click()
  }

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-black text-white p-8">
        <h1 className="text-5xl font-bold text-green-500 mb-8">
          Analytics
        </h1>

        <button
          onClick={exportCSV}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl text-white mb-6"
        >
          Export CSV
        </button>

        <div className="bg-zinc-900 p-4 rounded-xl mb-8">
          <label className="block text-zinc-400 mb-2">
            Bankroll initiale
          </label>

          <input
            type="number"
            value={initialBankroll}
            onChange={(e) => setInitialBankroll(Number(e.target.value))}
            className="w-64 bg-black border border-zinc-700 text-white p-3 rounded-xl"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-zinc-900 p-6 rounded-2xl">
            <p className="text-zinc-400">Total Profit</p>
            <h2 className="text-3xl font-bold text-green-500">
              {formatUnits(totalProfit)}u
            </h2>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <p className="text-zinc-400">Total Trades</p>
            <h2 className="text-3xl font-bold">{totalTrades}</h2>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <p className="text-zinc-400">Win Rate</p>
            <h2 className="text-3xl font-bold text-green-500">
              {formatPercent(winRate)}%
            </h2>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <p className="text-zinc-400">Average ROI</p>
            <h2 className="text-3xl font-bold text-green-500">
              {formatPercent(averageRoi)}%
            </h2>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <p className="text-zinc-400">Current Bankroll</p>
            <h2 className="text-3xl font-bold text-green-500">
             {formatUnits(currentBankroll ?? 0)}u
            </h2>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <p className="text-zinc-400">Best Win</p>
            <h2 className="text-3xl font-bold text-green-500">
              +{formatUnits(bestWin)}u
            </h2>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <p className="text-zinc-400">Worst Loss</p>
            <h2 className="text-3xl font-bold text-red-500">
              {formatUnits(worstLoss)}u
            </h2>
          </div>
        </div>

        {/* DEBUG BLOCK - Remove after verification */}
        
        

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-zinc-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-green-500">
              Bankroll Evolution
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData}>
                  <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
  formatter={(value) => [`${Number(value).toFixed(2)}u`, "Bankroll"]}
/>
                  <Line
                    type="monotone"
                    dataKey="bankroll"
                    stroke="#22c55e"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-zinc-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-green-500">
              Profit Cumulé
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData}>
                  <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip wrapperStyle={{ backgroundColor: '#0f172a', borderRadius: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="cumulativeProfit"
                    stroke="#22c55e"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-zinc-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-green-500">
              ROI
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData}>
                  <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" />
                  <Tooltip wrapperStyle={{ backgroundColor: '#0f172a', borderRadius: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="avgRoi"
                    stroke="#38bdf8"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-zinc-900 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-green-500">
              Win Rate
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData}>
                  <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" />
                  <Tooltip wrapperStyle={{ backgroundColor: '#0f172a', borderRadius: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="winRate"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <section className="bg-zinc-900 p-6 rounded-2xl mt-10">
          <h2 className="text-2xl font-bold mb-4 text-green-500">Win / Loss Breakdown</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.name === "Wins" ? "#22c55e" : "#ef4444"}
                    />
                  ))}
                </Pie>
                <Tooltip wrapperStyle={{ backgroundColor: '#0f172a', borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  )
}