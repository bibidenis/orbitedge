"use client"

import type { ReactNode } from "react"
import { useRequireAuth } from "@/lib/auth"

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { loading } = useRequireAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-400">Vérification de l'utilisateur...</p>
      </div>
    )
  }

  return <>{children}</>
}
