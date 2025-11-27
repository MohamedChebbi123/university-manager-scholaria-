'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Adminstrativenavbar from "../components/adminstrativenavbar"

interface StudentAbsence {
  user_id: number
  first_name: string
  last_name: string
  email: string
  absence_id: number
  is_absent: boolean
  date: string | null
  recorded_at: string
}

interface SessionData {
  session_id: number
  class_id: number
  class_name: string
  room: string
  day: string
  start_time: string
  end_time: string
  professor: string
  students: StudentAbsence[]
}

interface SubjectData {
  subject_id: number
  subject_name: string
  total_students: number
  total_absences: number
  total_present: number
  total_records: number
  sessions: SessionData[]
}

interface AdminAbsenceData {
  admin_id: number
  admin_name: string
  total_subjects: number
  total_students: number
  total_absences: number
  subjects: SubjectData[]
}

export default function AdminAbsenceHistoryPage() {
  const router = useRouter()
  const [role, setRole] = useState<string>("")
  const [absencesData, setAbsencesData] = useState<AdminAbsenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [expandedSessions, setExpandedSessions] = useState<Set<number>>(new Set())

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token")
      const storedRole = localStorage.getItem("role")

      if (!token) return router.push("/UserLogin")
      setRole(storedRole || "")

      if (storedRole !== "administrative") {
        setError("Access denied. Administrative users only.")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`http://localhost:8000/admin_all_absences_by_subject`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) throw new Error("Failed to fetch absence data")

        const data: AdminAbsenceData = await response.json()
        setAbsencesData(data)
      } catch (err) {
        console.error(err)
        setError("Unable to fetch absence data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const toggleSession = (sessionId: number) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId)
      } else {
        newSet.add(sessionId)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <>
        {role === "administrative" && <Adminstrativenavbar />}
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10 px-4">
          <div className="py-16 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Loading absence data...</p>
          </div>
        </div>
      </>
    )
  }

  if (error || !absencesData) {
    return (
      <>
        {role === "administrative" && <Adminstrativenavbar />}
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10 px-4">
          <div className="max-w-2xl mx-auto mt-16 text-center">
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Data</h2>
              <p className="text-gray-600">{error || "No absence data found"}</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  const filteredSubjects = selectedSubject === "all" 
    ? absencesData.subjects 
    : absencesData.subjects.filter(s => s.subject_name === selectedSubject)

  const filteredStats = {
    total_records: filteredSubjects.reduce((sum, s) => sum + s.total_records, 0),
    total_absences: filteredSubjects.reduce((sum, s) => sum + s.total_absences, 0),
    total_present: filteredSubjects.reduce((sum, s) => sum + s.total_present, 0),
  }

  return (
    <>
      {role === "administrative" && <Adminstrativenavbar />}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 mb-2">
              All Student Absences by Subject
            </h1>
            <p className="text-gray-600">
              Administrator: {absencesData.admin_name}
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-sm font-semibold mb-2 opacity-90">Total Subjects</h3>
              <p className="text-3xl font-bold">{absencesData.total_subjects}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-sm font-semibold mb-2 opacity-90">Total Students</h3>
              <p className="text-3xl font-bold">{absencesData.total_students}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-sm font-semibold mb-2 opacity-90">Total Records</h3>
              <p className="text-3xl font-bold">{filteredStats.total_records}</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-sm font-semibold mb-2 opacity-90">Total Absences</h3>
              <p className="text-3xl font-bold">{filteredStats.total_absences}</p>
            </div>
          </div>
          
          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-sm font-semibold mb-2 opacity-90">Total Present</h3>
              <p className="text-3xl font-bold">{filteredStats.total_present}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-sm font-semibold mb-2 opacity-90">Attendance Rate</h3>
              <p className="text-3xl font-bold">
                {filteredStats.total_records > 0 
                  ? `${Math.round((filteredStats.total_present / filteredStats.total_records) * 100)}%`
                  : "0%"}
              </p>
            </div>
          </div>

          {/* Subject Filter */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Filter by Subject</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSubject("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedSubject === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Subjects
              </button>
              {absencesData.subjects.map(subject => (
                <button
                  key={subject.subject_id}
                  onClick={() => setSelectedSubject(subject.subject_name)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedSubject === subject.subject_name
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {subject.subject_name}
                </button>
              ))}
            </div>
          </div>

          {/* Subjects List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Subjects</h2>
            
            {filteredSubjects.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Subjects Found
                </h3>
                <p className="text-gray-600">
                  There are no subjects with absence records yet.
                </p>
              </div>
            )}

            {filteredSubjects.map(subject => (
              <div key={subject.subject_id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Subject Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6 text-white">
                  <h3 className="text-2xl font-bold mb-3">{subject.subject_name}</h3>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                      Students: {subject.total_students}
                    </span>
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                      Records: {subject.total_records}
                    </span>
                    <span className="bg-red-300 text-red-900 px-3 py-1 rounded-full font-semibold">
                      Absences: {subject.total_absences}
                    </span>
                    <span className="bg-green-300 text-green-900 px-3 py-1 rounded-full font-semibold">
                      Present: {subject.total_present}
                    </span>
                  </div>
                </div>

                {/* Sessions */}
                <div className="p-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">Sessions ({subject.sessions.length})</h4>
                  <div className="space-y-3">
                    {subject.sessions.map(session => (
                      <div key={session.session_id} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Session Header */}
                        <button
                          onClick={() => toggleSession(session.session_id)}
                          className="w-full bg-gray-50 hover:bg-gray-100 px-4 py-3 flex items-center justify-between transition-colors"
                        >
                          <div className="flex items-center gap-4 text-left flex-wrap">
                            <span className="font-semibold text-gray-800">{session.class_name}</span>
                            <span className="text-sm text-gray-600">Professor: {session.professor}</span>
                            <span className="text-sm text-gray-600">Room: {session.room}</span>
                            <span className="text-sm text-gray-600">{session.day}</span>
                            <span className="text-sm text-gray-600">{session.start_time} - {session.end_time}</span>
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                              {session.students.length} records
                            </span>
                          </div>
                          <span className="text-2xl text-gray-400">
                            {expandedSessions.has(session.session_id) ? "−" : "+"}
                          </span>
                        </button>

                        {/* Student List */}
                        {expandedSessions.has(session.session_id) && (
                          <div className="bg-white p-4">
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Student Name</th>
                                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Email</th>
                                    <th className="text-center py-2 px-3 text-sm font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {session.students.map(student => (
                                    <tr key={student.absence_id} className="border-b border-gray-100 hover:bg-gray-50">
                                      <td className="py-3 px-3">
                                        <span className="font-medium text-gray-800">
                                          {student.first_name} {student.last_name}
                                        </span>
                                      </td>
                                      <td className="py-3 px-3 text-sm text-gray-600">{student.email}</td>
                                      <td className="py-3 px-3 text-center">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                          student.is_absent
                                            ? "bg-red-100 text-red-700"
                                            : "bg-green-100 text-green-700"
                                        }`}>
                                          {student.is_absent ? "Absent" : "Present"}
                                        </span>
                                      </td>
                                      <td className="py-3 px-3 text-sm text-gray-600">{student.recorded_at}</td>
                                    </tr>
                                  ))}
                                  {session.students.length === 0 && (
                                    <tr>
                                      <td colSpan={4} className="py-8 text-center text-gray-500">
                                        No attendance records for this session
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
