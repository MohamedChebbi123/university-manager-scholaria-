'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Directive_navbar from "@/app/components/directive_navbar"

interface SessionDetails {
  session_id: number
  class_id: number
  room_id: number
  room_name?: string
  professor_id: number
  professor_name?: string
  subject_id: number
  subject_name?: string
  start_time: string
  end_time: string
  day: string
}

interface Absence {
  absence_id: number
  user_id: number
  first_name: string
  last_name: string
  email: string
  is_absent: boolean
  date: string | null
}

interface SessionAbsenceData {
  session_id: number
  class_id: number
  class_name: string
  subject: string
  day: string
  start_time: string
  end_time: string
  absences: Absence[]
  total_students: number
  total_absent: number
}

export default function SingleSessionPage() {
  const { id, session_id } = useParams()
  const router = useRouter()
  const [session, setSession] = useState<SessionDetails | null>(null)
  const [absenceData, setAbsenceData] = useState<SessionAbsenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const savedRole = localStorage.getItem("role")
    setRole(savedRole)

    if (savedRole === "director") {
      fetchSessionDetails()
      fetchAbsenceData()
    } else {
      setLoading(false)
    }
  }, [session_id, id])

  const fetchSessionDetails = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const res = await fetch(`https://university-manager-scholaria-6.onrender.com/fetch_single_session_for_director/${session_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!res.ok) throw new Error("Failed to fetch session details")

      const data: SessionDetails = await res.json()
      setSession(data)
      console.log(data)
    } catch (err) {
      console.error(err)
      alert("Error fetching session details")
    }
  }

  const fetchAbsenceData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const res = await fetch(`https://university-manager-scholaria-6.onrender.com/absences/class_for_director/${id}/session/${session_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!res.ok) throw new Error("Failed to fetch absence data")

      const data: SessionAbsenceData = await res.json()
      setAbsenceData(data)
    } catch (err) {
      console.error(err)
      alert("Error fetching absence data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Directive_navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10 px-4">
          <div className="py-16 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-700">Loading session details...</p>
          </div>
        </div>
      </>
    )
  }

  if (role !== "director") {
    return (
      <>
        <Directive_navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10 px-4">
          <div className="max-w-2xl mx-auto mt-16 text-center">
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8">
              <p className="text-red-600 text-lg font-medium">You are not authorized to access this page.</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!session) {
    return (
      <>
        <Directive_navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10 px-4">
          <div className="max-w-2xl mx-auto mt-16 text-center">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <p className="text-gray-600 text-lg">Session not found</p>
              <button
                onClick={() => router.back()}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Directive_navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Class Schedule
            </button>
            
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800">
                Session Details
              </h1>
            </div>
          </div>

          {/* Session Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
            {session && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {session.subject_name || `Session #${session.session_id}`}
                  </h2>
                  {session.professor_name && (
                    <p className="text-lg text-gray-600">Professor: {session.professor_name}</p>
                  )}
                  {absenceData && (
                    <p className="text-md text-gray-500 mt-1">Class: {absenceData.class_name}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Day */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
                    <p className="text-sm text-gray-600 mb-2">Day</p>
                    <p className="text-2xl font-bold text-purple-600">{session.day}</p>
                  </div>

                  {/* Start Time */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
                    <p className="text-sm text-gray-600 mb-2">Start Time</p>
                    <p className="text-2xl font-bold text-green-600">{session.start_time}</p>
                  </div>

                  {/* End Time */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6 border border-orange-100">
                    <p className="text-sm text-gray-600 mb-2">End Time</p>
                    <p className="text-2xl font-bold text-orange-600">{session.end_time}</p>
                  </div>

                  {/* Room */}
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-6 border border-pink-100">
                    <p className="text-sm text-gray-600 mb-2">Room</p>
                    <p className="text-2xl font-bold text-pink-600">{session.room_name || `#${session.room_id}`}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Attendance Statistics */}
          {absenceData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 mb-6">
                Attendance Statistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                  <p className="text-sm text-gray-600 mb-2">Total Students</p>
                  <p className="text-3xl font-bold text-blue-600">{absenceData.total_students}</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-6 border border-red-100">
                  <p className="text-sm text-gray-600 mb-2">Total Absent</p>
                  <p className="text-3xl font-bold text-red-600">{absenceData.total_absent}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
                  <p className="text-sm text-gray-600 mb-2">Attendance Rate</p>
                  <p className="text-3xl font-bold text-green-600">
                    {absenceData.total_students > 0 
                      ? Math.round(((absenceData.total_students - absenceData.total_absent) / absenceData.total_students) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Absence List */}
          {absenceData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800">
                  Student Attendance List
                </h2>
              </div>
              
              {absenceData.absences.length === 0 ? (
                <div className="text-center py-16">
                  <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-2xl font-semibold text-gray-400 mb-2">No Attendance Records</h3>
                  <p className="text-gray-500">No attendance has been recorded for this session yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {absenceData.absences.map((absence, index) => (
                        <tr key={absence.absence_id} className={`${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {absence.first_name} {absence.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {absence.user_id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {absence.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              absence.is_absent 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {absence.is_absent ? '❌ Absent' : '✅ Present'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {absence.date ? new Date(absence.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}