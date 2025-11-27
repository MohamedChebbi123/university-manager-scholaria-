'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Adminstrativenavbar from "@/app/components/adminstrativenavbar"
import ProfessorNavbar from "@/app/components/professornavbar"
import Link from 'next/link'

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
  profile_picture: string
  description: string
  users: User[]
}

interface Professor {
  user_id: number
  first_name: string
  last_name: string
  email: string
  subjects: { subject_id: number; subject_name: string }[]
}

interface Room {
  room_id: number
  room_name: string
  type: string
}

interface SessionData {
  session_id: number
  start_time: string
  end_time: string
  day: string
  professor?: Professor
  room?: Room
  subject?: { subject_id: number; subject_name: string }
  professor_id?: number
  room_id?: number
  subject_id?: number
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

export default function SingleClassPage() {
  const { id, class_id } = useParams()
  const router = useRouter()

  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [professors, setProfessors] = useState<Professor[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [selectedCell, setSelectedCell] = useState<{ day: string, start: string, end: string } | null>(null)
  const [selectedProfessor, setSelectedProfessor] = useState("")
  const [selectedRoom, setSelectedRoom] = useState("")
  const [subjectId, setSubjectId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  
  // Statistics states
  const [showStatistics, setShowStatistics] = useState(false)
  const [statistics, setStatistics] = useState<any>(null)
  const [loadingStats, setLoadingStats] = useState(false)
  
  // Ratrapage states
  const [showRatrapageModal, setShowRatrapageModal] = useState(false)
  const [ratrapages, setRatrapages] = useState<RatrapageData[]>([])
  const [loadingRatrapages, setLoadingRatrapages] = useState(false)
  const [editingRatrapageId, setEditingRatrapageId] = useState<number | null>(null)
  const [ratrapageForm, setRatrapageForm] = useState({
    user_id: "",
    room_id: "",
    subject_id: "",
    date: "",
    start_time: "",
    end_time: "",
    description: ""
  })

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  const formatTime = (time: string) => {
    if (!time) return ""
    const [hourStr, minuteStr] = time.split(":")
    const hour = parseInt(hourStr, 10)
    return `${hour}:${minuteStr}`
  }

  const generateTimes = () => {
    const times: string[] = []
    let startMinutes = 8 * 60 + 30
    const endMinutes = 17 * 60 + 30

    while (startMinutes < endMinutes) {
      const end = startMinutes + 90
      const startHour = Math.floor(startMinutes / 60)
      const startMin = startMinutes % 60
      const endHour = Math.floor(end / 60)
      const endMin = end % 60

      const startStr = `${startHour}:${startMin.toString().padStart(2, "0")}`
      const endStr = `${endHour}:${endMin.toString().padStart(2, "0")}`

      times.push(`${startStr} - ${endStr}`)
      startMinutes += 90
    }

    return times
  }

  const times = generateTimes()

  useEffect(() => {
    const storedRole = localStorage.getItem("role")
    setRole(storedRole)

    if (!token) {
      setError("Authentication required. Redirecting to login...")
      setLoading(false)
      router.push("/UserLogin")
      return
    }

    if (!id || !class_id) return

    const fetchData = async () => {
      try {
        setLoading(true)

        const [classRes, profRes, roomRes, sessionsRes, ratrapagesRes] = await Promise.all([
          fetch(`http://127.0.0.1:8000/fetch_class/${class_id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://127.0.0.1:8000/fetch_professors`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://127.0.0.1:8000/fetch_rooms/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://127.0.0.1:8000/fetch_sessions/${class_id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://127.0.0.1:8000/fetch_ratrapages/${class_id}`, { headers: { Authorization: `Bearer ${token}` } }),
        ])

        const [classData, profData, roomData, sessionsData, ratrapagesData] = await Promise.all([
          classRes.json(), profRes.json(), roomRes.json(), sessionsRes.json(), ratrapagesRes.json()
        ])

        setClassInfo(classData)
        setProfessors(Array.isArray(profData) ? profData : [])
        setRooms(Array.isArray(roomData) ? roomData : [])
        setSessions(Array.isArray(sessionsData) ? sessionsData : [])
        setRatrapages(Array.isArray(ratrapagesData) ? ratrapagesData : [])
        // Debug: log sessions returned from API to help verify shape
        console.debug('fetched sessions:', sessionsData)

      } catch (err) {
        console.error("Error fetching data:", err)
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, class_id, token, router])

  const handleProfessorChange = (professorId: string) => {
    setSelectedProfessor(professorId)
    // Reset subject when professor changes
    setSubjectId(null)
  }

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCell || !selectedProfessor || !selectedRoom || !subjectId) {
      alert("Please fill all fields")
      return
    }

    const res = await fetch("http://127.0.0.1:8000/add_session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        class_id: parseInt(class_id as string),
        room_id: parseInt(selectedRoom),
        professor_id: parseInt(selectedProfessor),
        subject_id: subjectId,
        start_time: selectedCell.start,
        end_time: selectedCell.end,
        day: selectedCell.day,
      }),
    })

    const data = await res.json().catch(() => ({ detail: "Invalid JSON response" }))
    if (res.ok) {
      alert("✅ Session added successfully!")
      const prof = professors.find(p => p.user_id === parseInt(selectedProfessor))!
      const subj = prof.subjects.find(s => s.subject_id === subjectId)!
      const room = rooms.find(r => r.room_id === parseInt(selectedRoom))!

      setSessions(prev => [...prev, {
        session_id: data.session_id,
        start_time: selectedCell.start,
        end_time: selectedCell.end,
        day: selectedCell.day,
        professor: prof,
        room,
        subject: subj,
      }])
      setSelectedCell(null)
      setSelectedProfessor("")
      setSelectedRoom("")
      setSubjectId(null)
    } else {
      alert(`❌ ${data.detail || "Error adding session"}`)
    }
  }

  const handleAddRatrapage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!ratrapageForm.user_id || !ratrapageForm.room_id || !ratrapageForm.subject_id || 
        !ratrapageForm.date || !ratrapageForm.start_time || !ratrapageForm.end_time) {
      alert("Please fill all required fields")
      return
    }

    if (editingRatrapageId) {
      await handleUpdateRatrapage()
    } else {
      await handleCreateRatrapage()
    }
  }

  const handleCreateRatrapage = async () => {
    const res = await fetch("http://127.0.0.1:8000/add_ratrappage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: parseInt(ratrapageForm.user_id),
        class_id: parseInt(class_id as string),
        room_id: parseInt(ratrapageForm.room_id),
        department_id: parseInt(id as string),
        subject_id: parseInt(ratrapageForm.subject_id),
        date: ratrapageForm.date,
        start_time: `${ratrapageForm.date}T${ratrapageForm.start_time}:00`,
        end_time: `${ratrapageForm.date}T${ratrapageForm.end_time}:00`,
        description: ratrapageForm.description || null
      }),
    })

    const data = await res.json().catch(() => ({ detail: "Invalid JSON response" }))
    if (res.ok) {
      alert("✅ Ratrapage added successfully!")
      await refreshRatrapages()
      resetRatrapageForm()
    } else {
      alert(`❌ ${data.detail || "Error adding ratrapage"}`)
    }
  }

  const handleUpdateRatrapage = async () => {
    const res = await fetch(`http://127.0.0.1:8000/update_ratrapage/${editingRatrapageId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: parseInt(ratrapageForm.user_id),
        class_id: parseInt(class_id as string),
        room_id: parseInt(ratrapageForm.room_id),
        department_id: parseInt(id as string),
        subject_id: parseInt(ratrapageForm.subject_id),
        date: ratrapageForm.date,
        start_time: `${ratrapageForm.date}T${ratrapageForm.start_time}:00`,
        end_time: `${ratrapageForm.date}T${ratrapageForm.end_time}:00`,
        description: ratrapageForm.description || null
      }),
    })

    const data = await res.json().catch(() => ({ detail: "Invalid JSON response" }))
    if (res.ok) {
      alert("✅ Ratrapage updated successfully!")
      await refreshRatrapages()
      resetRatrapageForm()
    } else {
      alert(`❌ ${data.detail || "Error updating ratrapage"}`)
    }
  }

  const refreshRatrapages = async () => {
    const ratrapagesRes = await fetch(`http://127.0.0.1:8000/fetch_ratrapages/${class_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const ratrapagesData = await ratrapagesRes.json()
    setRatrapages(Array.isArray(ratrapagesData) ? ratrapagesData : [])
  }

  const resetRatrapageForm = () => {
    setShowRatrapageModal(false)
    setEditingRatrapageId(null)
    setRatrapageForm({
      user_id: "",
      room_id: "",
      subject_id: "",
      date: "",
      start_time: "",
      end_time: "",
      description: ""
    })
  }

  const handleEditRatrapage = (ratrapage: RatrapageData) => {
    const startTime = new Date(ratrapage.start_time).toTimeString().slice(0, 5)
    const endTime = new Date(ratrapage.end_time).toTimeString().slice(0, 5)
    
    setEditingRatrapageId(ratrapage.ratrapage_id)
    setRatrapageForm({
      user_id: ratrapage.user_id.toString(),
      room_id: ratrapage.room_id.toString(),
      subject_id: ratrapage.subject_id.toString(),
      date: ratrapage.date,
      start_time: startTime,
      end_time: endTime,
      description: ratrapage.description || ""
    })
    setShowRatrapageModal(true)
  }

  const handleDeleteRatrapage = async (ratrapageId: number) => {
    if (!confirm("Are you sure you want to delete this ratrapage session?")) {
      return
    }

    const res = await fetch(`http://127.0.0.1:8000/delete_ratrapage/${ratrapageId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await res.json().catch(() => ({ detail: "Invalid JSON response" }))
    if (res.ok) {
      alert("✅ Ratrapage deleted successfully!")
      await refreshRatrapages()
    } else {
      alert(`❌ ${data.detail || "Error deleting ratrapage"}`)
    }
  }

  const handleDeleteSession = async (sessionId: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm("Are you sure you want to delete this session?")) {
      return
    }

    const res = await fetch(`http://127.0.0.1:8000/delete_session/${sessionId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await res.json().catch(() => ({ detail: "Invalid JSON response" }))
    if (res.ok) {
      alert("✅ Session deleted successfully!")
      setSessions(prev => prev.filter(s => s.session_id !== sessionId))
    } else {
      alert(`❌ ${data.detail || "Error deleting session"}`)
    }
  }

  const fetchStatistics = async () => {
    setLoadingStats(true)
    try {
      const res = await fetch(`http://127.0.0.1:8000/class/${class_id}`, {
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

  const renderSession = (day: string, timeRange: string) => {
    const [start] = timeRange.split(" - ")
    const session = sessions.find(s =>
      s.day.toLowerCase() === day.toLowerCase() &&
      formatTime(s.start_time) === start
    )
    if (!session) {
      return role === "administrative" ? (
        <button
          onClick={() => {
            const [s, e] = timeRange.split(" - ")
            setSelectedCell({ day, start: s, end: e })
          }}
          className="w-full h-full flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded text-2xl font-light"
        >
          +
        </button>
      ) : (
        <span className="text-gray-400 text-xs">—</span>
      )
    }

    // Resolve professor/room/subject whether API returned nested objects or only IDs
    const prof = session.professor ?? (typeof session.professor_id === 'number' ? professors.find(p => p.user_id === session.professor_id) : undefined)
    const room = session.room ?? (typeof session.room_id === 'number' ? rooms.find(r => r.room_id === session.room_id) : undefined)

    let subjectName = session.subject?.subject_name ?? "—"
    if (!session.subject && prof && typeof session.subject_id === 'number') {
      const found = prof.subjects.find(s => s.subject_id === session.subject_id)
      if (found) subjectName = found.subject_name
    }

    const professorName = prof ? `${prof.first_name} ${prof.last_name}` : (typeof session.professor_id === 'number' ? `Professor #${session.professor_id}` : "—")
    const roomName = room?.room_name ?? (typeof session.room_id === 'number' ? `Room #${session.room_id}` : "—")

    return (
      <Link 
        href={`/fetch_departments/${id}/single_class/${class_id}/single_session/${session.session_id}`}
        className="block h-full relative group"
      >
        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg p-3 text-sm h-full hover:from-blue-200 hover:to-indigo-200 transition-all cursor-pointer shadow-sm hover:shadow-md">
          <div className="font-semibold text-blue-700 mb-1">{subjectName}</div>
          <div className="text-gray-700 text-xs mb-1">👤 {professorName}</div>
          <div className="text-gray-600 text-xs">📍 {roomName}</div>
          {role === "administrative" && (
            <button
              onClick={(e) => handleDeleteSession(session.session_id, e)}
              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              title="Delete session"
            >
              ×
            </button>
          )}
        </div>
      </Link>
    )
  }

  return (
    <>
      {role === "professor" && <ProfessorNavbar />}
      {role === "administrative" && <Adminstrativenavbar />}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10 px-4">
        {loading ? (
          <div className="py-16 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-700">Loading class details...</p>
          </div>
        ) : error ? (
          <div className="max-w-2xl mx-auto mt-16 text-center">
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8">
              <p className="text-red-600 text-lg font-medium">{error}</p>
            </div>
          </div>
        ) : classInfo ? (
          <div className="container mx-auto max-w-7xl">
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-3 rounded-lg shadow-sm">
              <Link href="/fetch_departments" className="hover:text-blue-600 transition-colors">Departments</Link>
              <span className="text-gray-400">›</span>
              <Link href={`/fetch_departments/${id}`} className="hover:text-blue-600 transition-colors">Department</Link>
              <span className="text-gray-400">›</span>
              <span className="text-gray-900 font-medium">{classInfo.name}</span>
            </nav>

            {/* Class Header Section */}
            <div className="mb-8">
              <div className="text-center mb-6">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800">
                  {classInfo.name}
                </h1>
                {(role === "administrative" || role === "professor") && (
                  <button
                    onClick={fetchStatistics}
                    disabled={loadingStats}
                    className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {loadingStats ? "Loading..." : showStatistics ? "Hide Statistics" : "📊 View Statistics"}
                  </button>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full md:w-64 h-48 flex-shrink-0">
                    <img
                      src={classInfo.profile_picture || "/default.png"}
                      alt={classInfo.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {classInfo.users.map((user, index) => (
                          <tr key={user.user_id} className={`${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {user.profile_picture ? (
                                  <img className="h-10 w-10 rounded-full object-cover" src={user.profile_picture} alt={`${user.first_name} ${user.last_name}`} />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                    {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                  </div>
                                )}
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.first_name?.toLowerCase() || 'user'}</div>
                                  <div className="text-sm text-gray-500">{user.role}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.first_name} {user.last_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{user.role}</span>
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 text-center flex-1">
                  Weekly Schedule
                </h2>
                {role === "administrative" && (
                  <button
                    onClick={() => setShowRatrapageModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    + Add Ratrapage
                  </button>
                )}
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full table-fixed border-collapse text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <th className="border border-blue-500 px-3 py-3 font-semibold w-32">Time</th>
                        {days.map(day => (
                          <th key={day} className="border border-blue-500 px-3 py-3 font-semibold text-left">{day}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {times.map((time, idx) => (
                        <tr key={time} className="hover:bg-blue-50 transition-colors">
                          <td className="border border-gray-300 px-3 py-3 font-medium text-gray-700 bg-gray-50 text-center">{time}</td>
                          {days.map(day => (
                            <td key={`${day}-${time}`} className="border border-gray-300 px-2 py-2 align-top">
                              {renderSession(day, time)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Ratrapages Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-purple-800 to-pink-800 mb-4 text-center">
                Ratrapage Sessions
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
                        <div key={ratrapage.ratrapage_id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200 shadow-sm hover:shadow-md transition-all relative">
                          {role === "administrative" && (
                            <div className="absolute top-3 right-3 flex gap-2">
                              <button
                                onClick={() => handleEditRatrapage(ratrapage)}
                                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors shadow-sm"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteRatrapage(ratrapage.ratrapage_id)}
                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors shadow-sm"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                          
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 pr-20">
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

            {/* Ratrapage Modal */}
            {showRatrapageModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <form onSubmit={handleAddRatrapage} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
                    {editingRatrapageId ? "Edit Ratrapage Session" : "Add Ratrapage Session"}
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Professor *</label>
                      <select
                        value={ratrapageForm.user_id}
                        onChange={(e) => setRatrapageForm({...ratrapageForm, user_id: e.target.value})}
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                        required
                      >
                        <option value="">Select Professor</option>
                        {professors.map(prof => (
                          <option key={prof.user_id} value={prof.user_id}>
                            {prof.first_name} {prof.last_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                      <select
                        value={ratrapageForm.subject_id}
                        onChange={(e) => setRatrapageForm({...ratrapageForm, subject_id: e.target.value})}
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                        required
                      >
                        <option value="">Select Subject</option>
                        {professors.flatMap(prof => prof.subjects).filter((subj, index, self) => 
                          index === self.findIndex(s => s.subject_id === subj.subject_id)
                        ).map(subject => (
                          <option key={subject.subject_id} value={subject.subject_id}>
                            {subject.subject_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Room *</label>
                      <select
                        value={ratrapageForm.room_id}
                        onChange={(e) => setRatrapageForm({...ratrapageForm, room_id: e.target.value})}
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                        required
                      >
                        <option value="">Select Room</option>
                        {rooms.map(room => (
                          <option key={room.room_id} value={room.room_id}>
                            {room.room_name} ({room.type})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                      <input
                        type="date"
                        value={ratrapageForm.date}
                        onChange={(e) => setRatrapageForm({...ratrapageForm, date: e.target.value})}
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                        <input
                          type="time"
                          value={ratrapageForm.start_time}
                          onChange={(e) => setRatrapageForm({...ratrapageForm, start_time: e.target.value})}
                          className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                        <input
                          type="time"
                          value={ratrapageForm.end_time}
                          onChange={(e) => setRatrapageForm({...ratrapageForm, end_time: e.target.value})}
                          className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={ratrapageForm.description}
                        onChange={(e) => setRatrapageForm({...ratrapageForm, description: e.target.value})}
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                        rows={3}
                        placeholder="Optional description..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      {editingRatrapageId ? "Update Ratrapage" : "Add Ratrapage"}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowRatrapageModal(false)
                        setEditingRatrapageId(null)
                        setRatrapageForm({
                          user_id: "",
                          room_id: "",
                          subject_id: "",
                          date: "",
                          start_time: "",
                          end_time: "",
                          description: ""
                        })
                      }} 
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Add Session Modal */}
            {selectedCell && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <form onSubmit={handleAddSession} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                  <h2 className="text-2xl font-bold mb-2 text-gray-800 text-center">
                    Add Session
                  </h2>
                  <p className="text-center text-gray-600 mb-6">
                    {selectedCell.day} • {selectedCell.start} - {selectedCell.end}
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Professor</label>
                      <select
                        value={selectedProfessor}
                        onChange={(e) => handleProfessorChange(e.target.value)}
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">Select Professor</option>
                        {professors.map(p => (
                          <option key={p.user_id} value={p.user_id}>
                            {p.first_name} {p.last_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedProfessor && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                        <select
                          value={subjectId || ""}
                          onChange={(e) => setSubjectId(e.target.value ? parseInt(e.target.value) : null)}
                          className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="">Select Subject</option>
                          {professors.find(p => p.user_id === parseInt(selectedProfessor))?.subjects?.map(subject => (
                            <option key={subject.subject_id} value={subject.subject_id}>
                              {subject.subject_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                      <select
                        value={selectedRoom}
                        onChange={(e) => setSelectedRoom(e.target.value)}
                        className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">Select Room</option>
                        {rooms.map(r => <option key={r.room_id} value={r.room_id}>{r.room_name} ({r.type})</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Save Session
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setSelectedCell(null)} 
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            
          </div>
        ) : null}
      </div>
    </>
  )
}
