'use client'

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Directive_navbar from "@/app/components/directive_navbar"

interface User {
  user_id: number
  first_name: string
  last_name: string
  email: string
  role: string
  profile_picture?: string
  joined_at?: string
}

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

interface RatrapageData {
  ratrapage_id: number
  user_id: number
  class_id: number
  room_id: number
  department_id: number
  subject_id: number
  date: string
  start_time: string
  end_time: string
  description?: string
  professor?: {
    user_id: number
    first_name: string
    last_name: string
    email: string
  }
  room?: {
    room_id: number
    room_name: string
    type: string
  }
  subject?: {
    subject_id: number
    subject_name: string
  }
}

interface ClassInfo {
  class_id: number
  name: string
  capacity: number
  profile_picture?: string
  description?: string
  users: User[]
}

export default function ClassDetailsPage() {
  const { id } = useParams()
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [ratrapages, setRatrapages] = useState<RatrapageData[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string | null>(null)
  
  // Statistics states
  const [showStatistics, setShowStatistics] = useState(false)
  const [statistics, setStatistics] = useState<any>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const START_HOUR = 8.5 // 8:30
  const END_HOUR = 18
  const INTERVAL = 1.5 // 1h30

  useEffect(() => {
    const savedRole = localStorage.getItem("role")
    setRole(savedRole)

    if (savedRole === "director") {
      fetchClassInfo()
      fetchClassSessions()
      fetchRatrapages()
    } else {
      setLoading(false)
    }
  }, [id])

  const fetchClassInfo = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const res = await fetch(`http://127.0.0.1:8000/fetch_class_for_director/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (!res.ok) throw new Error("Failed to fetch class info")

      const data: ClassInfo = await res.json()
      setClassInfo(data)
    } catch (err) {
      console.error(err)
      alert("Error fetching class info")
    }
  }

  const fetchClassSessions = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const res = await fetch(`http://127.0.0.1:8000/fetch_class_session_for_director/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (!res.ok) throw new Error("Failed to fetch class sessions")

      const data: Session[] = await res.json()
      setSessions(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      alert("Error fetching class sessions")
    } finally {
      setLoading(false)
    }
  }

  const fetchRatrapages = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const res = await fetch(`http://127.0.0.1:8000/fetch_ratrapages/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (!res.ok) throw new Error("Failed to fetch ratrapages")

      const data: RatrapageData[] = await res.json()
      setRatrapages(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      console.log("Error fetching ratrapages")
    }
  }

  const fetchStatistics = async () => {
    setLoadingStats(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const res = await fetch(`http://127.0.0.1:8000/class/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setStatistics(data)
        setShowStatistics(true)
      } else {
        alert("Failed to fetch statistics")
      }
    } catch (err) {
      console.error("Error fetching statistics:", err)
      alert("Error fetching statistics")
    } finally {
      setLoadingStats(false)
    }
  }

  const getAbsenceRateColor = (rate: number) => {
    if (rate < 10) return "text-green-600 bg-green-50"
    if (rate < 20) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const renderSchedule = () => {
    const schedule: { [key: string]: Session | null } = {}

    // initialize empty schedule
    DAYS.forEach(day => {
      for (let hour = START_HOUR; hour < END_HOUR; hour += INTERVAL) {
        const key = `${day}-${hour.toFixed(2)}`
        schedule[key] = null
      }
    })

    // fill schedule with sessions
    sessions.forEach(sess => {
      const [startHourStr, startMinStr] = sess.start_time.split(":")
      const hourDecimal = parseInt(startHourStr) + (parseInt(startMinStr) / 60)
      const key = `${sess.day}-${hourDecimal.toFixed(2)}`
      schedule[key] = sess
    })

    return (
      <table className="min-w-full border-collapse text-center text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <th className="border border-blue-500 px-3 py-3 font-semibold">Time</th>
            {DAYS.map(day => (
              <th key={day} className="border border-blue-500 px-3 py-3 font-semibold">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil((END_HOUR - START_HOUR)/INTERVAL) }, (_, i) => {
            const hour = START_HOUR + i * INTERVAL
            const startHour = Math.floor(hour)
            const startMin = hour % 1 === 0 ? "00" : "30"
            const endTime = hour + INTERVAL
            const endHour = Math.floor(endTime)
            const endMin = endTime % 1 === 0 ? "00" : "30"
            const timeLabel = `${startHour}:${startMin} - ${endHour}:${endMin}`

            return (
              <tr key={i} className="hover:bg-blue-50 transition-colors">
                <td className="border border-gray-300 px-3 py-3 font-medium text-gray-700 bg-gray-50">
                  {timeLabel}
                </td>
                {DAYS.map(day => {
                  const key = `${day}-${hour.toFixed(2)}`
                  const sess = schedule[key]
                  return (
                    <td
                      key={key}
                      className={`border border-gray-300 px-3 py-3 ${
                        sess
                          ? "bg-gradient-to-br from-blue-100 to-indigo-100 font-medium text-gray-800"
                          : "bg-white text-gray-400"
                      }`}
                    >
                      {sess ? (
                        <Link
                          href={`/department_directive/${id}/single_session/${sess.session_id}`}
                          className="block space-y-1 hover:opacity-80 transition-opacity"
                        >
                          <div className="font-semibold text-blue-700">
                            {sess.subject_name || "-"}
                          </div>
                          <div className="text-xs text-gray-600">
                            📍 {sess.room_name || "No room"}
                          </div>
                        </Link>
                      ) : (
                        <span className="text-xs">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  if (loading) {
    return (
      <>
        <Directive_navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10 px-4">
          <div className="py-16 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-700">Loading class details...</p>
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

  if (!classInfo) {
    return (
      <>
        <Directive_navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10 px-4">
          <div className="max-w-2xl mx-auto mt-16 text-center">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <p className="text-gray-600 text-lg">Class not found</p>
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
        <div className="container mx-auto max-w-7xl">
          {/* Class Header Section */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800">
                {classInfo.name}
              </h1>
              <button
                onClick={fetchStatistics}
                disabled={loadingStats}
                className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {loadingStats ? "Loading..." : showStatistics ? "Hide Statistics" : "📊 View Statistics"}
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {classInfo.profile_picture && (
                  <div className="w-full md:w-64 h-48 flex-shrink-0">
                    <img
                      src={classInfo.profile_picture}
                      alt={classInfo.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                      <p className="text-sm text-gray-600 mb-1">Capacity</p>
                      <p className="text-2xl font-bold text-blue-600">{classInfo.capacity}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                      <p className="text-sm text-gray-600 mb-1">Total Students</p>
                      <p className="text-2xl font-bold text-purple-600">{classInfo.users.length}</p>
                    </div>
                  </div>
                  {classInfo.description && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Description</p>
                      <p className="text-gray-700">{classInfo.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          {showStatistics && statistics && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-indigo-800 to-purple-800 text-center flex-1">
                  Class Statistics
                </h2>
                <button
                  onClick={() => setShowStatistics(false)}
                  className="text-gray-500 hover:text-gray-700 font-semibold"
                >
                  ✕ Close
                </button>
              </div>

              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Total Students</p>
                    <span className="text-2xl">👥</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{statistics.total_students}</p>
                  <p className="text-xs text-gray-500 mt-1">Capacity: {statistics.capacity}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Total Sessions</p>
                    <span className="text-2xl">📅</span>
                  </div>
                  <p className="text-3xl font-bold text-indigo-600">{statistics.total_sessions}</p>
                  <p className="text-xs text-gray-500 mt-1">Scheduled classes</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Total Absences</p>
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="text-3xl font-bold text-orange-600">{statistics.total_absences}</p>
                  <p className="text-xs text-gray-500 mt-1">Recorded absences</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Absence Rate</p>
                    <span className="text-2xl">📈</span>
                  </div>
                  <p className={`text-3xl font-bold ${statistics.absence_rate < 10 ? 'text-green-600' : statistics.absence_rate < 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {statistics.absence_rate}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Overall rate</p>
                </div>
              </div>

              {/* Student Absence Statistics */}
              {statistics.student_absence_stats && statistics.student_absence_stats.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                  <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800">Student Absence Statistics</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Student</th>
                          <th className="px-6 py-3 text-center text-xs font-semibold uppercase">Absences</th>
                          <th className="px-6 py-3 text-center text-xs font-semibold uppercase">Rate</th>
                          <th className="px-6 py-3 text-center text-xs font-semibold uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {statistics.student_absence_stats.map((student: any, index: number) => (
                          <tr key={student.user_id} className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="text-lg font-bold text-gray-900">{student.absence_count}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getAbsenceRateColor(student.absence_rate)}`}>
                                {student.absence_rate}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {student.absence_rate < 10 ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                  ✓ Good
                                </span>
                              ) : student.absence_rate < 20 ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                  ⚠ Warning
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                  ✕ Critical
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Subject Distribution */}
              {statistics.subjects && statistics.subjects.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Subject Distribution</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {statistics.subjects.map((subject: any) => (
                      <div key={subject.subject_id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-lg font-bold text-purple-700">{subject.subject_name}</h4>
                          <span className="text-2xl">📚</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Sessions</span>
                          <span className="text-2xl font-bold text-purple-600">{subject.session_count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Students Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 mb-4 text-center">
              Students
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {classInfo.users.length === 0 ? (
                <div className="text-center py-16">
                  <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-2xl font-semibold text-gray-400 mb-2">No Students Found</h3>
                  <p className="text-gray-500">No students are enrolled in this class yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Full name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                      
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {classInfo.users.map((user, index) => (
                        <tr key={user.user_id} className={`${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {user.profile_picture ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={user.profile_picture}
                                  alt={`${user.first_name} ${user.last_name}`}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                  {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                </div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.first_name?.toLowerCase() || 'user'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.role}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.first_name} {user.last_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.joined_at ? new Date(user.joined_at).toLocaleString('en-US', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Schedule Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 mb-4 text-center">
              Class Schedule
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-auto">
              {sessions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No sessions scheduled yet</p>
              ) : (
                renderSchedule()
              )}
            </div>
          </div>

          {/* Ratrapages Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-purple-800 to-pink-800 mb-4 text-center">
              check ups Sessions
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {ratrapages.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No Ratrapage Sessions</h3>
                  <p className="text-gray-500">No ratrapage sessions have been scheduled yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ratrapages.map((ratrapage) => {
                    const professor = ratrapage.professor
                    const room = ratrapage.room
                    const subject = ratrapage.subject
                    
                    return (
                      <div key={ratrapage.ratrapage_id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-purple-700 mb-1">
                              {subject?.subject_name || 'Subject'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              📅 {new Date(ratrapage.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center text-sm text-gray-700">
                            <span className="mr-2">🕐</span>
                            <span>
                              {new Date(ratrapage.start_time).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })} - {new Date(ratrapage.end_time).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-700">
                            <span className="mr-2">👤</span>
                            <span>
                              {professor ? `${professor.first_name} ${professor.last_name}` : 'Professor'}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-700">
                            <span className="mr-2">📍</span>
                            <span>
                              {room?.room_name || 'Room'} {room?.type && `(${room.type})`}
                            </span>
                          </div>
                        </div>
                        
                        {ratrapage.description && (
                          <div className="mt-3 pt-3 border-t border-purple-200">
                            <p className="text-xs text-gray-600 italic">
                              {ratrapage.description}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
