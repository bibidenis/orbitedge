"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Sidebar from "../Sidebar"

export default function TradesPage() {
  const [trades, setTrades] = useState<any[]>([])
const [search, setSearch] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function loadTrades() {
      const { data: { session }, error: sessionError } =
        await supabase.auth.getSession()

      if (sessionError || !session) {
        router.replace("/auth")
        return
      }

      const { data: strategies, error: strategiesError } = await supabase
        .from("strategies")
        .select("id, name")
        .eq("user_id", session.user.id)

      if (strategiesError) {
        console.error(strategiesError)
        return
      }

      const strategyIds = (strategies || []).map((strategy) => strategy.id)

      const { data: tradesData, error: tradesError } = strategyIds.length
        ? await supabase
            .from("trades")
            .select("*")
            .in("strategy_id", strategyIds)
            .order("created_at", { ascending: false })
        : { data: [] }

      if (tradesError) {
        console.error(tradesError)
        return
      }

      const normalizedTrades = (tradesData || []).map((trade) => {
        const strategy = strategies?.find(
          (strategyItem: any) => strategyItem.id === trade.strategy_id
        )

        return {
          ...trade,
          strategyName: strategy?.name ?? "Unknown",
        }
      })

      setTrades(normalizedTrades)
    }

    loadTrades()
  }, [router])

  const filteredTrades = trades.filter((trade) =>
    (trade.match || "")
      .toLowerCase()
      .includes(search.toLowerCase())
)
function exportCSV() {
  const headers = ["Date", "Stratégie", "Match", "Cote", "Stake", "Résultat", "Profit"]

  const rows = trades.map((trade) => [
    trade.date,
    trade.strategyName,
    trade.match || "",
    trade.odds || "",
    trade.stake || "",
    trade.result || "",
    trade.profit || "",
  ])

  const csvContent = [
    headers.join(";"),
    ...rows.map((row) => row.join(";")),
  ].join("\n")

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = "orbitedge-trades.csv"
  link.click()

  URL.revokeObjectURL(url)
}
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-black text-white p-8">
       <button
  onClick={exportCSV}
  className="bg-green-500 text-black px-5 py-2 rounded-xl font-bold mb-6"
>
  Export CSV
</button>
        <input
  type="text"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Rechercher un match..."
  className="w-full bg-zinc-900 text-white p-3 rounded-xl mb-6"
/>
        {trades.length === 0 ? (
          <p className="text-zinc-400">Aucun trade enregistré.</p>
        ) : (
          <div className="space-y-4">
            {filteredTrades.map((trade) => (
              <div
                key={trade.id}
                className="bg-zinc-900 p-5 rounded-2xl"
              >
                <p className="text-zinc-400">{trade.date}</p>

                <h2 className="text-xl font-bold text-green-400">
                  {trade.match || "Match non renseigné"}
                </h2>

                <p>Stratégie : {trade.strategyName}</p>
                <p>Cote : {trade.odds}</p>
                <p>Stake : {trade.stake}</p>

                <p
                  className={
                    trade.result === "WIN"
                      ? "text-green-500 font-bold"
                      : "text-red-500 font-bold"
                  }
                >
                  {trade.result}
                </p>

                <p
                  className={
                    String(trade.profit).startsWith("+")
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {trade.profit}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}