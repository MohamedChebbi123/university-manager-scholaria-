'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Adminstrativenavbar from "../components/adminstrativenavbar"
import Directive_navbar from "../components/directive_navbar"

export default function StatisticsPage() {
  const router = useRouter()
  const [role, setRole] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const storedRole = localStorage.getItem("role")

    if (!token) {
      router.push("/UserLogin")
      return
    }

    setRole(storedRole || "")
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <>
        {role === "administrative" && <Adminstrativenavbar />}
        {role === "director" && <Directive_navbar />}
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10 px-4">
          <div className="py-16 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Loading...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {role === "administrative" && <Adminstrativenavbar />}
      {role === "director" && <Directive_navbar />}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 mb-2">
              Statistics Dashboard
            </h1>
            <p className="text-gray-600">
              View comprehensive statistics and analytics
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Statistics Coming Soon
            </h2>
            <p className="text-gray-600">
              This page will display comprehensive statistics and analytics for your institution.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}