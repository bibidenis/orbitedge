"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "./supabase"
import type { Session, User } from "@supabase/supabase-js"

export function useSupabaseAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, authSession) => {
      setSession(authSession)
      setUser(authSession?.user ?? null)
    })

    return () => {
      mounted = false
      subscription?.unsubscribe?.()
    }
  }, [])

  return { session, user, loading }
}

export function useRequireAuth() {
  const { session, loading } = useSupabaseAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/auth")
    }
  }, [loading, session, router])

  return { session, loading }
}
