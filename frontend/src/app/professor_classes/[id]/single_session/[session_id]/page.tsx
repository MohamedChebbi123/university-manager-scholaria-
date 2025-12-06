'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import ProfessorNavbar from "@/app/components/professornavbar"
import Link from "next/link"

interface SessionData {
  session_id: number
  class_id: number
  class_name: string | null
  room_id: number
  room_name: string | null
  professor_id: number
  subject_id: number
  subject_name: string | null
  start_time: string
  end_time: string
  day: string
}


interface Student {
  user_id: number
  first_name: string
  last_name: string
  email: string
  isAbsent?: boolean
}

export default function SingleSessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.session_id as string
  const classId = params.id as string

  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ⭐ ADDED: students state
  const [students, setStudents] = useState<Student[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [hasExistingAbsences, setHasExistingAbsences] = useState(false)

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/UserLogin")
          return
        }

        // Fetch session data
        const sessionRes = await fetch(`https://university-manager-scholaria-6.onrender.com/get_signle_session_info_professor/${sessionId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })

        if (!sessionRes.ok) {
          throw new Error("Failed to fetch session data")
        }

        const sessionData: SessionData = await sessionRes.json()
        setSession(sessionData)
        console.log("fetched sessionData:", sessionData)

        // ⭐ Fetch existing absences for this session
        try {
          const absencesRes = await fetch(`https://university-manager-scholaria-6.onrender.com/absences/class/${classId}/session/${sessionId}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          })

          if (absencesRes.ok) {
            const absencesData = await absencesRes.json()
            console.log("fetched absences:", absencesData)
            
            if (absencesData.absences && absencesData.absences.length > 0) {
              setHasExistingAbsences(true)
              // Map existing absences to students
              const studentsWithAbsences = absencesData.absences.map((absence: any) => ({
                user_id: absence.user_id,
                first_name: absence.first_name,
                last_name: absence.last_name,
                email: absence.email,
                isAbsent: absence.is_absent
              }))
              setStudents(studentsWithAbsences)
              setLoading(false)
              return
            }
          }
        } catch (absenceErr) {
          console.log("No existing absences found, fetching all students:", absenceErr)
        }

        // ⭐ If no existing absences, fetch all students of this class
        const studentsRes = await fetch(`https://university-manager-scholaria-6.onrender.com/get_students_for_session/${sessionData.class_id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })

        if (!studentsRes.ok) {
          throw new Error("Failed to fetch students for this session")
        }

        const studentsData = await studentsRes.json()
        // Initialize all students as present (isAbsent = false)
        setStudents(studentsData.map((s: Student) => ({ ...s, isAbsent: false })))

      } catch (err) {
        console.error("Error fetching session data:", err)
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    if (sessionId) {
      fetchSessionData()
    }
  }, [sessionId, router])

  const formatTime = (time: string) => {
    if (!time) return ""
    const [hourStr, minuteStr] = time.split(":")
    const hour = parseInt(hourStr, 10)
    return `${hour}:${minuteStr}`
  }

  const handleAbsenceToggle = (userId: number) => {
    setStudents(prev => 
      prev.map(student => 
        student.user_id === userId 
          ? { ...student, isAbsent: !student.isAbsent }
          : student
      )
    )
  }

  const handleSubmitAttendance = async () => {
    try {
      setSubmitting(true)
      setSuccessMessage(null)
      const token = localStorage.getItem("token")
      
      if (!token) {
        alert("You must be logged in to submit attendance")
        return
      }

      // Submit absence for each student
      const promises = students.map(student => 
        fetch("https://university-manager-scholaria-6.onrender.com/assign_absence", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            user_id: student.user_id,
            class_id: parseInt(classId),
            session_id: parseInt(sessionId),
            is_absent: student.isAbsent || false
          })
        })
      )

      const results = await Promise.all(promises)
      
      // Check if all requests were successful
      const allSuccessful = results.every(res => res.ok)
      
      if (allSuccessful) {
        setSuccessMessage("Attendance submitted successfully!")
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        alert("Some attendance records failed to submit. Please try again.")
      }
      
    } catch (error) {
      console.error("Error submitting attendance:", error)
      alert("Failed to submit attendance. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <ProfessorNavbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-10 px-4">
          <div className="py-16 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-700">Loading session details...</p>
          </div>
        </div>
      </>
    )
  }

  if (error || !session) {
    return (
      <>
        <ProfessorNavbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-10 px-4">
          <div className="max-w-2xl mx-auto mt-16 text-center">
            <div className="bg-white rounded-xl shadow-xl border border-red-200 p-8">
              <p className="text-red-600 text-lg font-medium">{error || "Session not found"}</p>
              <Link 
                href={`/professor_classes/${classId}`}
                className="mt-4 inline-block text-blue-600 hover:text-blue-800 underline"
              >
                ← Back to Class
              </Link>
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
        <div className="container mx-auto max-w-5xl">

          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-3 rounded-lg shadow-md border border-gray-200">
            <Link href="/professor_classes" className="hover:text-blue-600 transition-colors">
              My Classes
            </Link>
            <span className="text-gray-400">›</span>
            <Link href={`/professor_classes/${classId}`} className="hover:text-blue-600 transition-colors">
              Class
            </Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 font-medium">Session Details</span>
          </nav>

          {/* Session Header */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                Session Details
              </h1>
            </div>

            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Day / Time */}
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg p-6 border border-blue-300">
                  <div className="flex items-center gap-3 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h2 className="text-xl font-bold text-blue-900">Schedule</h2>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">{session.day}</p>
                  <p className="text-gray-700">
                    {formatTime(session.start_time)} - {formatTime(session.end_time)}
                  </p>
                </div>

                {/* Class Info */}
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-6 border border-purple-300">
                  <div className="flex items-center gap-3 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h2 className="text-xl font-bold text-purple-900">Class</h2>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {session.class_name || `Class #${session.class_id}`}
                  </p>
                </div>

                {/* Room Info */}
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-6 border border-green-300">
                  <div className="flex items-center gap-3 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h2 className="text-xl font-bold text-green-900">Room</h2>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {session.room_name || `Room #${session.room_id}`}
                  </p>
                </div>

                {/* Subject Info */}
                <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg p-6 border border-orange-300">
                  <div className="flex items-center gap-3 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h2 className="text-xl font-bold text-orange-900">Subject</h2>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {session.subject_name || `Subject #${session.subject_id}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ⭐ Take Attendance Card */}
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Take Attendance</h2>
              {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {successMessage}
                </div>
              )}
            </div>

            {students.length === 0 ? (
              <p className="text-gray-600">No students found for this class.</p>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-700">
                  <p>Check the box for absent students. Leave unchecked for present students.</p>
                </div>
                <ul className="divide-y divide-gray-200">
                  {students.map((student) => (
                    <li key={student.user_id} className="py-4 flex items-center justify-between hover:bg-gray-50 px-4 rounded-lg transition-colors">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-gray-600 text-sm">{student.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={student.isAbsent || false}
                            onChange={() => handleAbsenceToggle(student.user_id)}
                            className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 focus:ring-2 cursor-pointer"
                          />
                          <span className={`font-medium ${student.isAbsent ? 'text-red-600' : 'text-green-600'}`}>
                            {student.isAbsent ? 'Absent' : 'Present'}
                          </span>
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSubmitAttendance}
                    disabled={submitting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-800 text-white font-semibold px-8 py-3 rounded-lg transition-all flex items-center gap-2 shadow-lg hover:scale-105"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Submit Attendance
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ⭐ Existing Attendance Records Card */}
          {hasExistingAbsences && (
            <div className="bg-white rounded-xl shadow-xl border border-indigo-300 p-8 mb-10">
              <div className="flex items-center gap-3 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="text-2xl font-bold text-gray-900">Previous Attendance Record</h2>
              </div>

              <div className="mb-4 bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-3 rounded-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium">This session already has recorded attendance. You can update it above if needed.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-4 border border-green-300">
                  <p className="text-sm text-green-700 mb-1">Total Students</p>
                  <p className="text-3xl font-bold text-green-900">{students.length}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg p-4 border border-blue-300">
                  <p className="text-sm text-blue-700 mb-1">Present</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {students.filter(s => !s.isAbsent).length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-lg p-4 border border-red-300">
                  <p className="text-sm text-red-700 mb-1">Absent</p>
                  <p className="text-3xl font-bold text-red-900">
                    {students.filter(s => s.isAbsent).length}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 mb-3">Student Status:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {students.map((student) => (
                    <div 
                      key={student.user_id} 
                      className={`p-4 rounded-lg border-2 ${
                        student.isAbsent 
                          ? 'bg-red-50 border-red-300' 
                          : 'bg-green-50 border-green-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{student.email}</p>
                          <p className="font-semibold text-gray-800">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-xs text-gray-600">{student.email}</p>
                        </div>
                        <span 
                          className={`px-3 py-1 rounded-full text-sm font-bold ${
                            student.isAbsent 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {student.isAbsent ? '✕ Absent' : '✓ Present'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <Link
              href={`/professor_classes/${classId}`}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-all flex items-center gap-2 hover:scale-105 shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Class
            </Link>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            Session ID: {session.session_id}
          </div>

        </div>
      </div>
    </>
  )
}
