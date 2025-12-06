'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Adminstrativenavbar from "@/app/components/adminstrativenavbar"
import ProfessorNavbar from "@/app/components/professornavbar"

interface SessionDetail {
  session_id: number
  class_id: number
  room_id: number
  room_name?: string
  professor_id: number
  professor_name?: string
  subject_id: number
  start_time: string
  end_time: string
  day: string
}

interface Professor {
  user_id: number
  first_name: string
  last_name: string
  email: string
}

interface Room {
  room_id: number
  room_name: string
  type: string
}

interface Subject {
  subject_id: number
  subject_name: string
}

interface ClassInfo {
  class_id: number
  name: string
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

interface AbsenceData {
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
  const { id, class_id, session_id } = useParams()
  const router = useRouter()

  const [session, setSession] = useState<SessionDetail | null>(null)
  const [professor, setProfessor] = useState<Professor | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [subject, setSubject] = useState<Subject | null>(null)
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [absenceData, setAbsenceData] = useState<AbsenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  useEffect(() => {
    const storedRole = localStorage.getItem("role")
    setRole(storedRole)

    if (!token) {
      setError("Authentication required. Redirecting to login...")
      setLoading(false)
      router.push("/UserLogin")
      return
    }

    if (!session_id) return

    const fetchSessionData = async () => {
      try {
        setLoading(true)

        // Fetch session details
        const sessionRes = await fetch(
          `https://university-manager-scholaria-6.onrender.com/fetch_single_session_for_admin/${session_id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        if (!sessionRes.ok) {
          throw new Error("Failed to fetch session details")
        }

        const sessionData = await sessionRes.json()
        setSession(sessionData)

        // Fetch absence data
        const absenceRes = await fetch(
          `https://university-manager-scholaria-6.onrender.com/absences/class_for_admin/${class_id}/session/${session_id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        if (absenceRes.ok) {
          const absenceData = await absenceRes.json()
          setAbsenceData(absenceData)
        }

        // Fetch class and subject info (professor and room now come from session data)
        const [profRes, classRes] = await Promise.all([
          fetch(`https://university-manager-scholaria-6.onrender.com/fetch_professor/${sessionData.professor_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`https://university-manager-scholaria-6.onrender.com/fetch_class/${sessionData.class_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        const [profData, classData] = await Promise.all([
          profRes.json(),
          classRes.json()
        ])

        setProfessor(profData)
        setClassInfo(classData)

        // Set room from session data
        if (sessionData.room_name) {
          setRoom({
            room_id: sessionData.room_id,
            room_name: sessionData.room_name,
            type: "" // Type not available from session endpoint
          })
        }

        // Fetch subject from professor's subjects
        if (profData.subjects) {
          const foundSubject = profData.subjects.find(
            (s: Subject) => s.subject_id === sessionData.subject_id
          )
          if (foundSubject) {
            setSubject(foundSubject)
          }
        }

      } catch (err) {
        console.error("Error fetching session data:", err)
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchSessionData()
  }, [session_id, token, router])

  const formatTime = (time: string) => {
    if (!time) return ""
    const [hourStr, minuteStr] = time.split(":")
    const hour = parseInt(hourStr, 10)
    return `${hour}:${minuteStr}`
  }

  return (
    <>
      {role === "professor" && <ProfessorNavbar />}
      {role === "administrative" && <Adminstrativenavbar />}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10 px-4">
        {loading ? (
          <div className="py-16 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-700">Loading session details...</p>
          </div>
        ) : error ? (
          <div className="max-w-2xl mx-auto mt-16 text-center">
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8">
              <p className="text-red-600 text-lg font-medium">{error}</p>
              <button
                onClick={() => router.back()}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        ) : session ? (
          <div className="container mx-auto max-w-5xl">
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-3 rounded-lg shadow-sm">
              <Link href="/fetch_departments" className="hover:text-blue-600 transition-colors">
                Departments
              </Link>
              <span className="text-gray-400">›</span>
              <Link href={`/fetch_departments/${id}`} className="hover:text-blue-600 transition-colors">
                Department
              </Link>
              <span className="text-gray-400">›</span>
              <Link
                href={`/fetch_departments/${id}/single_class/${class_id}`}
                className="hover:text-blue-600 transition-colors"
              >
                {classInfo?.name || "Class"}
              </Link>
              <span className="text-gray-400">›</span>
              <span className="text-gray-900 font-medium">Session Details</span>
            </nav>

            {/* Session Header */}
            <div className="mb-8">
              <div className="text-center mb-6">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800">
                  Session Details
                </h1>
                <p className="text-gray-600 mt-2">
                  {session.day} • {formatTime(session.start_time)} - {formatTime(session.end_time)}
                </p>
              </div>

              {/* Main Session Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <h2 className="text-2xl font-bold text-white">
                    {subject?.subject_name || "Loading subject..."}
                  </h2>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Time Information */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-100">
                      <div className="flex items-center mb-3">
                        <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-800">Schedule</h3>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-700">
                          <span className="font-medium">Day:</span> {session.day}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Time:</span> {formatTime(session.start_time)} - {formatTime(session.end_time)}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Duration:</span> 1h 30min
                        </p>
                      </div>
                    </div>

                    {/* Professor Information */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-100">
                      <div className="flex items-center mb-3">
                        <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-800">Professor</h3>
                      </div>
                      {session.professor_name || professor ? (
                        <div className="space-y-2">
                          <p className="text-gray-700 font-medium text-lg">
                            {session.professor_name || (professor ? `${professor.first_name} ${professor.last_name}` : '')}
                          </p>
                          {professor && professor.email && (
                            <p className="text-gray-600 text-sm">
                              📧 {professor.email}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">Loading professor info...</p>
                      )}
                    </div>

                    {/* Room Information */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-100">
                      <div className="flex items-center mb-3">
                        <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-800">Room</h3>
                      </div>
                      {room ? (
                        <div className="space-y-2">
                          <p className="text-gray-700 font-medium text-lg">
                            {room.room_name}
                          </p>
                          <p className="text-gray-600">
                            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-200 text-green-800">
                              {room.type}
                            </span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500">Loading room info...</p>
                      )}
                    </div>

                    {/* Class Information */}
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-5 border border-orange-100">
                      <div className="flex items-center mb-3">
                        <svg className="w-6 h-6 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-800">Class</h3>
                      </div>
                      {classInfo ? (
                        <div className="space-y-2">
                          <p className="text-gray-700 font-medium text-lg">
                            {classInfo.name}
                          </p>
                          <Link
                            href={`/fetch_departments/${id}/single_class/${class_id}`}
                            className="inline-flex items-center text-sm text-orange-600 hover:text-orange-700 font-medium"
                          >
                            View class details →
                          </Link>
                        </div>
                      ) : (
                        <p className="text-gray-500">Loading class info...</p>
                      )}
                    </div>
                  </div>

                  {/* Session IDs (for debugging/admin) */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Session Information</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">Session ID:</span> {session.session_id}
                      </div>
                      <div>
                        <span className="font-medium">Class ID:</span> {session.class_id}
                      </div>
                      <div>
                        <span className="font-medium">Room ID:</span> {session.room_id}
                      </div>
                      <div>
                        <span className="font-medium">Professor ID:</span> {session.professor_id}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Absence Section */}
            {absenceData && (
              <div className="mb-8">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 mb-4 text-center">
                  Attendance Record
                </h2>

                {/* Attendance Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Students</p>
                        <p className="text-3xl font-bold text-blue-600">{absenceData.total_students}</p>
                      </div>
                      <svg className="w-12 h-12 text-blue-600 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Present</p>
                        <p className="text-3xl font-bold text-green-600">{absenceData.total_students - absenceData.total_absent}</p>
                      </div>
                      <svg className="w-12 h-12 text-green-600 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-5 border border-red-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Absent</p>
                        <p className="text-3xl font-bold text-red-600">{absenceData.total_absent}</p>
                      </div>
                      <svg className="w-12 h-12 text-red-600 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Student List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4">
                    <h3 className="text-xl font-bold text-white">Student Attendance List</h3>
                  </div>
                  
                  {absenceData.absences.length === 0 ? (
                    <div className="text-center py-16">
                      <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <h3 className="text-2xl font-semibold text-gray-400 mb-2">No Attendance Records</h3>
                      <p className="text-gray-500">No attendance data available for this session.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {absenceData.absences.map((absence, index) => (
                            <tr key={absence.absence_id} className={`${
                              absence.is_absent ? 'bg-red-50' : index % 2 === 1 ? 'bg-gray-50' : 'bg-white'
                            } hover:bg-gray-100 transition-colors`}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {index + 1}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                    {absence.first_name.charAt(0)}{absence.last_name.charAt(0)}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {absence.first_name} {absence.last_name}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {absence.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {absence.is_absent ? (
                                  <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Absent
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Present
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {absence.date ? new Date(absence.date).toLocaleDateString() : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                ← Back to Schedule
              </button>
              
              {role === "administrative" && (
                <button
                  onClick={() => {
                    // Add edit functionality here
                    alert("Edit functionality coming soon!")
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Edit Session
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}