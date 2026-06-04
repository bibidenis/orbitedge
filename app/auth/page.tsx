"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthPage() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    setLoading(true)
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!trimmedEmail || !trimmedPassword) {
      setMessage("Email et mot de passe sont requis.")
      setLoading(false)
      return
    }

    let authResponse

    if (mode === "sign-in") {
      authResponse = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      })
    } else {
      authResponse = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
      })
    }

    setLoading(false)

    if (authResponse.error) {
      setMessage(authResponse.error.message)
      return
    }

    if (mode === "sign-up") {
      setMessage(
        "Inscription réussie. Vérifie ton e-mail et connecte-toi ensuite."
      )
      return
    }

    router.push("/dashboard")
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-8">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 shadow-2xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight">
                {mode === "sign-in" ? "Sign In" : "Sign Up"}
              </h1>
              <p className="mt-3 text-zinc-400">
                Utilise ton email et ton mot de passe pour accéder à OrbitEdge.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10"
            >
              {mode === "sign-in" ? "Créer un compte" : "Se connecter"}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <label className="block">
              <span className="text-sm text-zinc-400">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-700 bg-black/80 px-4 py-3 text-white outline-none focus:border-emerald-400"
                placeholder="hello@example.com"
              />
            </label>

            <label className="block">
              <span className="text-sm text-zinc-400">Mot de passe</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-700 bg-black/80 px-4 py-3 text-white outline-none focus:border-emerald-400"
                placeholder="••••••••"
              />
            </label>

            {message ? (
              <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300">
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-emerald-400 px-6 py-4 text-black font-bold hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Chargement..."
                : mode === "sign-in"
                ? "Se connecter"
                : "Créer un compte"}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
