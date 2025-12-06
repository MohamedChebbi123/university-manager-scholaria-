'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Studentnavbar from "../components/studentnavbar"

interface AbsenceRecord {
  absence_id: number
  is_absent: boolean
  date: string | null
  recorded_at: string
}

interface SessionData {
  session_id: number
  subject_name: string
  subject_id: number
  class_name: string
  class_id: number
  professor: string
  room: string
  day: string
  start_time: string
  end_time: string
  total_records: number
  total_absences: number
  total_present: number
  absences: AbsenceRecord[]
}

interface StudentAbsencesData {
  student_id: number
  student_name: string
  total_sessions: number
  total_records: number
  total_absences: number
  total_present: number
  sessions: SessionData[]
}

export default function StudentAbsencesPage() {
  const router = useRouter()
  const [absencesData, setAbsencesData] = useState<StudentAbsencesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [role, setRole] = useState<string>("")
  const [expandedSessions, setExpandedSessions] = useState<Set<number>>(new Set())
  const [selectedSubject, setSelectedSubject] = useState<string>("all")

  useEffect(() => {
    const fetchAbsences = async () => {
      const token = localStorage.getItem("token")
      const storedRole = localStorage.getItem("role")

      if (!token) {
        router.push("/UserLogin")
        return
      }

      setRole(storedRole || "")

      try {
        const response = await fetch("https://university-manager-scholaria-6.onrender.com/student_all_absences", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch absences")
        }

        const data: StudentAbsencesData = await response.json()
        setAbsencesData(data)
      } catch (err) {
        console.error(err)
        setError("Unable to fetch absence records")
      } finally {
        setLoading(false)
      }
    }

    fetchAbsences()
  }, [router])

  const toggleSession = (sessionId: number) => {
    const newExpanded = new Set(expandedSessions)
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId)
    } else {
      newExpanded.add(sessionId)
    }
    setExpandedSessions(newExpanded)
  }

  // Get unique subject names for filter
  const uniqueSubjects = absencesData?.sessions
    ? Array.from(new Set(absencesData.sessions.map(s => s.subject_name))).sort()
    : []

  // Filter sessions by selected subject
  const filteredSessions = absencesData?.sessions.filter(session => 
    selectedSubject === "all" || session.subject_name === selectedSubject
  ) || []

  // Calculate filtered statistics
  const filteredStats = filteredSessions.reduce((acc, session) => {
    acc.total_records += session.total_records
    acc.total_absences += session.total_absences
    acc.total_present += session.total_present
    return acc
  }, { total_records: 0, total_absences: 0, total_present: 0 })

  if (loading) {
    return (
      <>
        {role === "student" && <Studentnavbar />}
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10 px-4">
          <div className="py-16 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Loading your absence records...</p>
          </div>
        </div>
      </>
    )
  }

  if (error || !absencesData) {
    return (
      <>
        {role === "student" && <Studentnavbar />}
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10 px-4">
          <div className="max-w-2xl mx-auto mt-16 text-center">
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Absences</h2>
              <p className="text-gray-600">{error || "No data available"}</p>
              <button
                onClick={() => router.push("/Student_class")}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Schedule
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {role === "student" && <Studentnavbar />}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push("/Student_class")}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors mb-4"
            >
              <span>←</span>
              <span>Back to Schedule</span>
            </button>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 mb-2">
              My Attendance History
            </h1>
            <p className="text-gray-600 text-lg">{absencesData.student_name}</p>
          </div>

          {/* Subject Filter */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-semibold text-gray-800">Filter by Subject</h3>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedSubject("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedSubject === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Subjects ({absencesData.total_sessions})
              </button>
              {uniqueSubjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedSubject === subject
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {subject} ({absencesData.sessions.filter(s => s.subject_name === subject).length})
                </button>
              ))}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-sm font-semibold text-gray-800">
                  {selectedSubject === "all" ? "Total Sessions" : "Filtered Sessions"}
                </h3>
              </div>
              <p className="text-4xl font-bold text-blue-600">
                {selectedSubject === "all" ? absencesData.total_sessions : filteredSessions.length}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-sm font-semibold text-gray-800">Total Records</h3>
              </div>
              <p className="text-4xl font-bold text-indigo-600">
                {selectedSubject === "all" ? absencesData.total_records : filteredStats.total_records}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-sm font-semibold text-gray-800">Total Absences</h3>
              </div>
              <p className="text-4xl font-bold text-red-600">
                {selectedSubject === "all" ? absencesData.total_absences : filteredStats.total_absences}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-sm font-semibold text-gray-800">Total Present</h3>
              </div>
              <p className="text-4xl font-bold text-green-600">
                {selectedSubject === "all" ? absencesData.total_present : filteredStats.total_present}
              </p>
            </div>
          </div>

          {/* Sessions List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6 text-white">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">Attendance by Subject</h2>
              </div>
            </div>

            <div className="p-6">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {selectedSubject === "all" 
                      ? "No attendance records found" 
                      : `No attendance records found for ${selectedSubject}`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSessions.map((session) => (
                    <div
                      key={session.session_id}
                      className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
                    >
                      {/* Session Header - Clickable */}
                      <button
                        onClick={() => toggleSession(session.session_id)}
                        className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 p-5 flex items-center justify-between hover:from-blue-100 hover:to-indigo-100 transition-colors"
                      >
                        <div className="flex items-start gap-4 flex-1 text-left">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800 mb-1">
                              {session.subject_name}
                            </h3>
                            <div className="grid md:grid-cols-3 gap-x-6 gap-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <span>Professor:</span>
                                <span>{session.professor}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>Class:</span>
                                <span>{session.class_name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>Schedule:</span>
                                <span>{session.day} - {session.start_time}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex gap-3 text-sm mb-1">
                              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-semibold">
                                Records: {session.total_records}
                              </span>
                              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
                                Absences: {session.total_absences}
                              </span>
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                                Present: {session.total_present}
                              </span>
                            </div>
                          </div>
                          <span className="text-2xl text-gray-500">
                            {expandedSessions.has(session.session_id) ? "▼" : "▶"}
                          </span>
                        </div>
                      </button>

                      {/* Expandable Absence History */}
                      {expandedSessions.has(session.session_id) && (
                        <div className="bg-white p-5 border-t-2 border-gray-200">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <span>Attendance History</span>
                          </h4>
                          <div className="space-y-3">
                            {session.absences.map((record) => (
                              <div
                                key={record.absence_id}
                                className={`border-2 rounded-lg p-4 flex items-center justify-between ${
                                  record.is_absent
                                    ? "border-red-200 bg-red-50"
                                    : "border-green-200 bg-green-50"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div>
                                    <h5
                                      className={`font-semibold ${
                                        record.is_absent ? "text-red-800" : "text-green-800"
                                      }`}
                                    >
                                      {record.is_absent ? "Marked Absent" : "Marked Present"}
                                    </h5>
                                    <p className="text-sm text-gray-600">
                                      {record.recorded_at}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                      record.is_absent
                                        ? "bg-red-100 text-red-700"
                                        : "bg-green-100 text-green-700"
                                    }`}
                                  >
                                    {record.is_absent ? "Absent" : "Present"}
                                  </div>
                                  {record.is_absent && (
                                    <button
                                      onClick={() => router.push(`/Student_class/${session.session_id}`)}
                                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                    >
                                      Request Revocation
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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
