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
import Sidebar from "../Sidebar"
import { supabase } from "@/lib/supabase"

export default function AnalyticsPage() {
  const [trades, setTrades] = useState<any[]>([])
  const [initialBankroll, setInitialBankroll] = useState(100)

  useEffect(() => {
    async function loadAnalytics() {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .order("created_at", { ascending: true })

      if (error) {
        console.error(error)
        return
      }

      setTrades(data || [])
    }

    loadAnalytics()
  }, [])

  const totalProfit = trades.reduce(
    (total, trade) => total + Number(trade.profit || 0),
    0
  )

  const totalTrades = trades.length

  const wins = trades.filter((trade) => trade.result === "WIN").length
  const losses = trades.filter((trade) => trade.result === "LOSS").length

  const winRate =
    totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : "0"

  const currentBankroll = initialBankroll + totalProfit

  const bestWin =
    trades.length > 0
      ? Math.max(...trades.map((trade) => Number(trade.profit || 0)))
      : 0

  const worstLoss =
    trades.filter((trade) => Number(trade.profit || 0) < 0).length > 0
      ? Math.min(...trades.map((trade) => Number(trade.profit || 0)))
      : 0

  const averageRoi =
    totalTrades > 0 ? (totalProfit / totalTrades).toFixed(2) : "0"

  let bankroll = initialBankroll

  const bankrollData = trades.map((trade, index) => {
    bankroll += Number(trade.profit || 0)

    return {
      trade: index + 1,
      bankroll,
    }
  })

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
              {totalProfit.toFixed(2)}u
            </h2>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <p className="text-zinc-400">Total Trades</p>
            <h2 className="text-3xl font-bold">{totalTrades}</h2>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <p className="text-zinc-400">Win Rate</p>
            <h2 className="text-3xl font-bold text-green-500">
              {winRate}%
            </h2>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <p className="text-zinc-400">Average ROI</p>
            <h2 className="text-3xl font-bold text-green-500">
              {averageRoi}%
            </h2>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <p className="text-zinc-400">Current Bankroll</p>
            <h2 className="text-3xl font-bold text-green-500">
              {currentBankroll.toFixed(2)}u
            </h2>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <p className="text-zinc-400">Best Win</p>
            <h2 className="text-3xl font-bold text-green-500">
              +{bestWin.toFixed(2)}u
            </h2>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <p className="text-zinc-400">Worst Loss</p>
            <h2 className="text-3xl font-bold text-red-500">
              {worstLoss.toFixed(2)}u
            </h2>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4 text-green-500">
          Bankroll Evolution
        </h2>

        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={bankrollData}>
              <XAxis dataKey="trade" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="bankroll"
                stroke="#22c55e"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <h2 className="text-2xl font-bold mb-4 text-green-500">
          Wins / Losses
        </h2>

        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  )
}