'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import ProfessorNavbar from "../components/professornavbar"

interface Session {
  session_id: number
  start_time: string
  end_time: string
  day: string
  class_name: string | null
  subject_name: string | null
  room_id: number | null
  room_name: string | null
}

interface ProfessorSessionsResponse {
  professor_id: string
  professor_name: string
  sessions: Session[]
}

interface Class {
  class_id: number
  name: string
  capacity: number
  profile_picture?: string
  description?: string
  department_id: number
}

interface ProfessorClassesResponse {
  professor_id: string
  professor_name: string
  classes: Class[]
}

export default function ProfessorDashboard() {
  const [role, setRole] = useState<string>("")
  const [sessions, setSessions] = useState<Session[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const userRole = localStorage.getItem("role")
    if (!userRole) {
      alert("You don't have a role.")
      setLoading(false)
    } else {
      setRole(userRole)
      if (userRole === "professor") {
        fetchData()
      } else {
        setLoading(false)
      }
    }
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("No authorization token found.")
        setLoading(false)
        return
      }

      // Fetch sessions
      const sessionRes = await fetch("https://university-manager-scholaria-6.onrender.com/fetch_session_for_professor", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (!sessionRes.ok) throw new Error("Failed to fetch sessions")
      const sessionData: ProfessorSessionsResponse = await sessionRes.json()
      setSessions(sessionData.sessions)

      // Fetch classes
      const classRes = await fetch("https://university-manager-scholaria-6.onrender.com/fetch_professor_classes", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (!classRes.ok) throw new Error("Failed to fetch classes")
      const classData: ProfessorClassesResponse = await classRes.json()
      setClasses(classData.classes)

    } catch (err) {
      console.error(err)
      alert("Error fetching data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        {role === "professor" && <ProfessorNavbar />}
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-10 px-4">
          <div className="py-16 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-700">Loading your dashboard...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {role === "professor" && <ProfessorNavbar />}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-10 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Sessions Section */}
          <div className="mb-12">
            <div className="max-w-4xl mx-auto text-center mb-8">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">My Sessions</h1>
              <p className="text-gray-700 mt-2">View your scheduled teaching sessions</p>
            </div>

            <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              {sessions.length === 0 ? (
                <div className="text-center py-16">
                  <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Sessions Found</h3>
                  <p className="text-gray-500">You don't have any scheduled sessions yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">Day</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">Start Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">End Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">Class</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">Room</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sessions.map((session, index) => (
                        <tr key={session.session_id} className={`${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                              {session.day}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {session.start_time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {session.end_time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {session.class_name || <span className="text-gray-400">-</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-700">
                            {session.subject_name || <span className="text-gray-400">-</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            📍 {session.room_name || <span className="text-gray-400">No room</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Classes Section */}
          <div className="mb-8">
            <div className="max-w-4xl mx-auto text-center mb-8">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">My Classes</h1>
              <p className="text-gray-700 mt-2">Manage and view your assigned classes</p>
            </div>

            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6">
              {classes.length === 0 ? (
                <div className="text-center py-16">
                  <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Classes Found</h3>
                  <p className="text-gray-500">You don't have any assigned classes yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {classes.map(cls => (
                    <Link 
                      key={cls.class_id} 
                      href={`/professor_classes/${cls.class_id}`}
                      className="group block overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-blue-300 hover:scale-105"
                    >
                      <div className="relative w-full h-44 bg-gray-100">
                        <img
                          src={cls.profile_picture || '/default.png'}
                          alt={cls.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                      </div>
                      <div className="p-5">
                        <h2 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{cls.name}</h2>
                        <div className="space-y-2 text-sm">
                          <p className="flex items-center text-gray-700">
                            <span className="font-semibold text-blue-600 mr-2">👥 Capacity:</span>
                            {cls.capacity}
                          </p>
                          <p className="flex items-center text-gray-700">
                            <span className="font-semibold text-purple-600 mr-2">🏢 Department:</span>
                            {cls.department_id}
                          </p>
                        </div>
                        {cls.description && (
                          <p className="text-sm text-gray-600 mt-3 line-clamp-2">{cls.description}</p>
                        )}
                        <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-gray-200">
                          <span className="text-gray-500">Click to view details</span>
                          <span className="text-blue-600 font-semibold group-hover:text-blue-700">View →</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
