"use client"
import { useState, useEffect } from "react"
export default function LayTheDrawPage() {
const [profit, setProfit] = useState(198.4)
const [roi, setRoi] = useState(7.21)
const [trades, setTrades] = useState(34)
useEffect(() => {
  localStorage.setItem(
    "layTheDrawStats",
    JSON.stringify({
      profit,
      roi,
      trades,
    })
  )
}, [profit, roi, trades])
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-5xl font-bold text-green-500 mb-8">
        Lay The Draw
      </h1>

      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-zinc-900 p-6 rounded-2xl">
          <p className="text-zinc-400">Profit</p>
          <h2 className="text-3xl font-bold text-green-400">
            +{profit}u
          </h2>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl">
          <p className="text-zinc-400">ROI</p>
          <h2 className="text-3xl font-bold text-green-400">
            {roi}%
          </h2>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl">
          <p className="text-zinc-400">Trades</p>
          <h2 className="text-3xl font-bold">
            {trades}
          </h2>
        </div>
      </div>

      <div className="bg-zinc-900 p-6 rounded-2xl mb-6">
        <h3 className="text-2xl font-bold mb-4">
          Conditions d’entrée
        </h3>

        <ul className="space-y-3 text-zinc-300">
          <li>✅ Match équilibré</li>
          <li>✅ 0-0 à la mi-temps</li>
          <li>✅ Minimum 10 tirs cumulés</li>
          <li>✅ Favori dominant possession</li>
        </ul>
      </div>

      <div className="bg-zinc-900 p-6 rounded-2xl">
        <h3 className="text-2xl font-bold mb-4">
          Gestion du trade
        </h3>

        <ul className="space-y-3 text-zinc-300">
          <li>🎯 Entrée : 55e minute</li>
          <li>🎯 Sortie : après le premier but</li>
          <li>🛑 Stop loss : 75e minute sans but</li>
        </ul>
      </div>
      <div className="mt-6">
  <button
  onClick={() => {
    setProfit(profit + 5)
    setTrades(trades + 1)
    setRoi(Number((roi + 0.2).toFixed(2)))
  }}
  className="bg-green-500 text-black px-4 py-2 rounded-xl mr-4"
>
  Add Win
</button>

  <button
  onClick={() => {
    setProfit(profit - 5)
    setTrades(trades + 1)
    setRoi(Number((roi - 0.2).toFixed(2)))
  }}
  className="bg-red-500 text-black px-4 py-2 rounded-xl"
>
  Add Loss
</button>
</div>
    </main>
  )
}