'use client'

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import ProfessorNavbar from "../../components/professornavbar"
import Link from "next/link"


interface User {
  user_id: number
  first_name: string
  last_name: string
  email: string
  role: string
  profile_picture?: string
  joined_at?: string
}

interface ClassInfo {
  class_id: number
  name: string
  capacity: number
  profile_picture?: string
  description?: string
  users: User[]
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
  professor_name: string | null
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
  class_name?: string
  department_name?: string
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

export default function ClassPage() {
  const params = useParams()
  const classId = params.id
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [ratrapages, setRatrapages] = useState<RatrapageData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [role, setRole] = useState<string>("")

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const START_HOUR = 8.5 // 8:30
  const END_HOUR = 18
  const INTERVAL = 1.5 // 1 hour 30 minutes

  useEffect(() => {
    const userRole = localStorage.getItem("role")
    if (userRole !== "professor") {
      alert("You don't have access.")
      setLoading(false)
      return
    }
    setRole(userRole)
    fetchClassInfo()
    fetchClassSessions()
    fetchRatrapages()
  }, [classId])

  const fetchClassInfo = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("No authorization token found.")
        setLoading(false)
        return
      }

      const res = await fetch(`https://university-manager-scholaria-6.onrender.com/fetch_classes_info_for_pr/${classId}`, {
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

      const res = await fetch(`https://university-manager-scholaria-6.onrender.com/fetch_class_session/${classId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (!res.ok) throw new Error("Failed to fetch class sessions")

      const data: Session[] = await res.json()
      setSessions(data)
      console.log(data)
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

      const res = await fetch(`https://university-manager-scholaria-6.onrender.com/fetch_ratrapages/${classId}`, {
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

  const renderSchedule = () => {
    const schedule: { [key: string]: Session | null } = {}

    
    DAYS.forEach(day => {
      for (let hour = START_HOUR; hour < END_HOUR; hour += INTERVAL) {
        const key = `${day}-${hour.toFixed(2)}`
        schedule[key] = null
      }
    })

    // Fill schedule with sessions
    sessions.forEach(sess => {
      const [startHourStr, startMinStr] = sess.start_time.split(":")
      const hourDecimal = parseInt(startHourStr) + (parseInt(startMinStr) / 60)
      const key = `${sess.day}-${hourDecimal.toFixed(2)}`
      schedule[key] = sess
    })

    return (
      <table className="min-w-full border-collapse text-center text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-blue-600 to-purple-600">
            <th className="border border-blue-500 px-3 py-3 font-semibold text-white">Time</th>
            {DAYS.map(day => (
              <th key={day} className="border border-blue-500 px-3 py-3 font-semibold text-white">
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
                          ? "bg-gradient-to-br from-blue-100 to-purple-100 font-medium text-gray-800"
                          : "bg-white text-gray-400"
                      }`}
                    >
                      {sess ? (
                        <Link
                          href={`/professor_classes/${classId}/single_session/${sess.session_id}`}
                          className="block space-y-1 hover:bg-blue-200 rounded-lg p-1 transition"
                        >
                            <div className="font-semibold text-blue-700">
                              {sess.subject_name || "-"}
                            </div>
                            {sess.professor_name && (
                              <div className="text-xs text-gray-700">
                                👤 {sess.professor_name}
                              </div>
                            )}
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
        <ProfessorNavbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-10 px-4">
          <div className="py-16 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-700">Loading class details...</p>
          </div>
        </div>
      </>
    )
  }

  if (!classInfo) {
    return (
      <>
        <ProfessorNavbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-10 px-4">
          <div className="max-w-2xl mx-auto mt-16 text-center">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8">
              <p className="text-gray-600 text-lg">Class not found</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <ProfessorNavbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-10 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Class Header Section */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                {classInfo.name}
              </h1>
            </div>

            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6">
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
                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-4 border border-blue-300">
                      <p className="text-sm text-blue-700 mb-1">Capacity</p>
                      <p className="text-2xl font-bold text-blue-900">{classInfo.capacity}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-4 border border-purple-300">
                      <p className="text-sm text-purple-700 mb-1">Total Students</p>
                      <p className="text-2xl font-bold text-purple-900">{classInfo.users.length}</p>
                    </div>
                  </div>
                  {classInfo.description && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Description</p>
                      <p className="text-gray-800">{classInfo.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Students Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-4 text-center">
              Students
            </h2>
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              {classInfo.users.length === 0 ? (
                <div className="text-center py-16">
                  <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Students Found</h3>
                  <p className="text-gray-500">No students are enrolled in this class yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Full name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          Joined at
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {classInfo.users.map((user, index) => (
                        <tr key={user.user_id} className={`${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
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
                                <div className="text-sm text-gray-600">
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
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-4 text-center">
              Class Schedule
            </h2>
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 overflow-auto">
              {sessions.length === 0 ? (
                <p className="text-center text-gray-600 py-8">No sessions scheduled yet</p>
              ) : (
                renderSchedule()
              )}
            </div>
          </div>

          {/* Ratrapages Section */}
          {ratrapages.length > 0 && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 mb-4 text-center">
                Ratrapage Sessions
              </h2>
              <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ratrapages.map((ratrapage) => {
                    const room = ratrapage.room
                    const subject = ratrapage.subject
                    
                    return (
                      <div key={ratrapage.ratrapage_id} className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-5 border border-purple-300 shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-purple-700 mb-1">
                              {subject?.subject_name || 'Subject'}
                            </h3>
                            <p className="text-sm text-gray-700">
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
                            <span className="mr-2">📚</span>
                            <span>
                              {ratrapage.class_name || classInfo?.name || 'Class'}
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
                          <div className="mt-3 pt-3 border-t border-purple-300">
                            <p className="text-xs text-gray-600 italic">
                              {ratrapage.description}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
