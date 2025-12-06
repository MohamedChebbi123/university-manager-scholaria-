'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Studentnavbar from "../components/studentnavbar"

interface ClassInfo {
  id: number
  name: string
  capacity: number
  description: string
}

interface StudentInfo {
  id: number
  first_name: string
  last_name: string
  email: string
  class: ClassInfo
}

interface SessionInfo {
  session_id: number
  day: string
  start_time: string
  end_time: string
  professor_name: string
  room_name: string
  subject_name: string
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

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function StudentDashboard() {
  const router = useRouter()
  const [role, setRole] = useState<string>("")
  const [student, setStudent] = useState<StudentInfo | null>(null)
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [ratrapages, setRatrapages] = useState<RatrapageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token")
      const storedRole = localStorage.getItem("role")

      if (!token) return router.push("/UserLogin")
      setRole(storedRole || "")

      try {
        const resStudent = await fetch("https://university-manager-scholaria-6.onrender.com/fetch_classes_for_student", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!resStudent.ok) throw new Error("Failed to fetch student info")
        const dataStudent: StudentInfo = await resStudent.json()
        setStudent(dataStudent)

        const resSessions = await fetch("https://university-manager-scholaria-6.onrender.com/fetch_session_for_students", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!resSessions.ok) throw new Error("Failed to fetch sessions")
        const dataSessions: any = await resSessions.json()
        const sessionsData: SessionInfo[] = Array.isArray(dataSessions)
          ? dataSessions
          : (dataSessions.sessions ?? [])
        setSessions(sessionsData)
        console.log('fetched sessions:', sessionsData)

        // Fetch ratrapages if student has a class
        if (dataStudent.class?.id) {
          try {
            const resRatrapages = await fetch(`https://university-manager-scholaria-6.onrender.com/fetch_ratrapages/${dataStudent.class.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            if (resRatrapages.ok) {
              const dataRatrapages: RatrapageData[] = await resRatrapages.json()
              setRatrapages(Array.isArray(dataRatrapages) ? dataRatrapages : [])
            }
          } catch (ratrapageErr) {
            console.log('Could not fetch ratrapages:', ratrapageErr)
          }
        }
      } catch (err) {
        console.error(err)
        setError("Unable to fetch data")
        router.push("/UserLogin")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <>
        {role === "student" && <Studentnavbar />}
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10 px-4">
          <div className="py-16 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        {role === "student" && <Studentnavbar />}
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10 px-4">
          <div className="max-w-2xl mx-auto mt-16 text-center">
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Data</h2>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  const timeSlots: string[] = []
  let startHour = 8
  let startMinute = 30

  while (startHour < 17 || (startHour === 17 && startMinute < 30)) {
    const from = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`
    let endHour = startHour + 1
    let endMinute = startMinute + 30
    if (endMinute >= 60) {
      endHour += 1
      endMinute -= 60
    }
    const to = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`
    timeSlots.push(`${from} - ${to}`)
    startHour = endHour
    startMinute = endMinute
  }

  const getSessionForSlot = (day: string, slot: string) => {
    const [slotStart, slotEnd] = slot.split(' - ')
    
    // Normalize time format: remove leading zero if present for comparison
    const normalizeTime = (time: string) => {
      const [h, m] = time.split(':')
      return `${parseInt(h)}:${m}`
    }
    
    const normalizedSlotStart = normalizeTime(slotStart)
    
    return sessions.find(s => {
      const normalizedSessionStart = normalizeTime(s.start_time)
      return s.day === day && normalizedSessionStart === normalizedSlotStart
    })
  }

  return (
    <>
      {role === "student" && <Studentnavbar />}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header Section */}
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 mb-2">
              Welcome, {student?.first_name}!
            </h1>
            <p className="text-gray-600">Here's your current class and schedule</p>
          </header>

          {/* Student Info Card */}
          {student && (
            <section className="mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{student.first_name} {student.last_name}</h2>
                    <p className="text-gray-600 flex items-center gap-2">
                      <span>📧</span>
                      <span>{student.email}</span>
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4">
                    <div className="font-semibold text-blue-800 text-lg mb-2">📚 {student.class.name}</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">ID:</span>
                        <span>{student.class.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Capacity:</span>
                        <span>{student.class.capacity}</span>
                      </div>
                    </div>
                    {student.class.description && (
                      <div className="mt-3 pt-3 border-t border-blue-200 text-xs text-gray-600">
                        {student.class.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Schedule Section Header */}
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800">
              Your Schedule
            </h2>
          </div>

          {/* Desktop / wide screens: table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="min-w-full table-fixed border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white sticky top-0 z-10">
                  <th className="border border-blue-500 px-4 py-3 text-left w-36 font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🕐</span>
                      <span>Time</span>
                    </div>
                  </th>
                  {daysOfWeek.map(day => (
                    <th key={day} className="border border-blue-500 px-4 py-3 text-left font-semibold">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot, idx) => (
                  <tr key={slot} className="hover:bg-blue-50 transition-colors duration-150">
                    <td className="border border-gray-300 px-4 py-3 align-top font-medium text-gray-700 bg-gray-50">{slot}</td>
                    {daysOfWeek.map(day => {
                      const session = getSessionForSlot(day, slot)
                      return (
                        <td key={day} className="border border-gray-300 px-3 py-3 align-top text-sm min-h-[6rem]">
                          {session ? (
                            <Link href={`/Student_class/${session.session_id}`} className="block">
                              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
                                <div className="font-bold text-sm mb-1">{session.subject_name}</div>
                                <div className="text-xs opacity-95 flex items-center gap-1">
                                  <span>👨‍🏫</span>
                                  <span>{session.professor_name || "TBA"}</span>
                                </div>
                                <div className="text-xs opacity-90 flex items-center gap-1 mt-0.5">
                                  <span>🚪</span>
                                  <span>{session.room_name || "TBA"}</span>
                                </div>
                              </div>
                            </Link>
                          ) : (
                            <div className="text-center text-gray-300 text-xs py-4">—</div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

          {/* Mobile: stacked per day */}
          <div className="md:hidden space-y-4">
          {daysOfWeek.map(day => {
            const daySessions = sessions.filter(s => s.day === day)
            return (
              <div key={day} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
                  <div className="font-semibold text-white">{day}</div>
                  <div className="text-xs text-white bg-white/20 px-3 py-1 rounded-full">
                    {daySessions.length} {daySessions.length === 1 ? 'session' : 'sessions'}
                  </div>
                </div>
                <div className="p-4">
                  {daySessions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-300 text-4xl mb-2">📅</div>
                      <p className="text-gray-400 text-sm">No sessions scheduled</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {daySessions.map(s => (
                        <Link key={s.session_id} href={`/Student_class/${s.session_id}`} className="block">
                          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
                            <div className="font-semibold text-base mb-2">{s.subject_name}</div>
                            <div className="flex items-center gap-2 text-xs mb-1.5 opacity-95">
                              <span>🕐</span>
                              <span>{s.start_time} - {s.end_time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs opacity-90 mb-1">
                              <span>👨‍🏫</span>
                              <span>{s.professor_name || 'TBA'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs opacity-90">
                              <span>🚪</span>
                              <span>{s.room_name || 'TBA'}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          </div>

          {/* Ratrapages Section */}
          {ratrapages.length > 0 && (
            <div className="mt-8">
              <div className="mb-6 text-center">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-purple-800 to-pink-800">
                  Ratrapage Sessions
                </h2>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}