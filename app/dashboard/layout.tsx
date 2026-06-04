import type { ReactNode } from "react"
import AuthGuard from "./AuthGuard"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>
}
