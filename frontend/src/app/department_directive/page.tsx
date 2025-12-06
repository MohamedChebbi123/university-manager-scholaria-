'use client'

import { useEffect, useState } from "react"
import Directive_navbar from "../components/directive_navbar"
import Link from "next/link"

export default function DirectorPage() {
  const [role, setRole] = useState<string | null>(null)
  const [departments, setDepartments] = useState<any[]>([])
  const [classesList, setClassesList] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedRole = localStorage.getItem("role")
    setRole(savedRole)

    if (savedRole === "director") {
      fetchDepartments()
      fetchClasses()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token")

      const res = await fetch("https://university-manager-scholaria-6.onrender.com/fetch_department_for_director", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await res.json()
      setDepartments(data)
      
      // Fetch subjects for the department
      if (data.length > 0) {
        fetchSubjects(data[0].id)
        fetchSessions(data[0].id)
      }

    } catch (err) {
      console.error(err)
    }
  }

  const fetchSubjects = async (departmentId: number) => {
    try {
      const token = localStorage.getItem("token")

      const res = await fetch(`https://university-manager-scholaria-6.onrender.com/fetch_subjects_with_professors/${departmentId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) throw new Error("Failed to fetch subjects")

      const data = await res.json()
      setSubjects(data)

    } catch (err) {
      console.error("Error fetching subjects:", err)
    }
  }

  const fetchSessions = async (departmentId: number) => {
    try {
      const token = localStorage.getItem("token")

      const res = await fetch(`https://university-manager-scholaria-6.onrender.com/fetch_sessions_by_department/${departmentId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) throw new Error("Failed to fetch sessions")

      const data = await res.json()
      setSessions(data.sessions || [])

    } catch (err) {
      console.error("Error fetching sessions:", err)
    }
  }

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token")

      const res = await fetch("https://university-manager-scholaria-6.onrender.com/fetch_classes_for_director", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) throw new Error("Unauthorized or invalid token")

      const data = await res.json()
      setClassesList(data)
      console.log(data.data)

    } catch (err) {
      console.error("Error fetching classes", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        {role === "director" && <Directive_navbar />}
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10 px-4">
          <div className="py-16 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-700">Loading...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {role === "director" && <Directive_navbar />}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10 px-4">
        <div className="container mx-auto">
          {role !== "director" ? (
            <div className="max-w-2xl mx-auto mt-16 text-center">
              <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8">
                <p className="text-red-600 text-lg font-medium">You are not authorized to access this page.</p>
              </div>
            </div>
          ) : (
            <>
              {/* ============================
                  DEPARTMENTS SECTION 
              =============================*/}
              {departments.length > 0 && (
                <div className="max-w-6xl mx-auto mb-16">
                  <div className="max-w-4xl mx-auto text-center mb-8">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800">Department</h1>
                    <p className="text-gray-600 mt-2">{departments[0].department_name}</p>
                  </div>

                  <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      {departments[0].profile_picture && (
                        <div className="w-full md:w-48 h-48 flex-shrink-0">
                          <img
                            src={departments[0].profile_picture}
                            alt={departments[0].department_name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">{departments[0].department_name}</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">{departments[0].description}</p>
                        <div className="text-sm text-gray-400">
                          <span>Created: {new Date(departments[0].created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================
                  SUBJECTS SECTION
              =============================*/}
              {subjects.length > 0 && (
                <div className="max-w-6xl mx-auto mb-16">
                  <div className="max-w-4xl mx-auto text-center mb-8">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800">Subjects</h1>
                    <p className="text-gray-600 mt-2">View all subjects in your department</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {subjects.map((subject, index) => (
                        <div
                          key={subject.subject_id || index}
                          className="group block overflow-hidden rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 shadow-sm hover:shadow-md transition-all duration-200 border border-purple-100"
                        >
                          <div className="p-5">
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              </div>
                              <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                x{subject.multiplier}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                              {subject.subject_name}
                            </h3>
                            <div className="flex items-center text-sm text-gray-600 mt-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="font-medium">{subject.professor_name}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ============================
                  SESSIONS SECTION
              =============================*/}
              {sessions.length > 0 && (
                <div className="max-w-6xl mx-auto mb-16">
                  <div className="max-w-4xl mx-auto text-center mb-8">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800">Sessions</h1>
                    <p className="text-gray-600 mt-2">View all sessions in your department</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Professor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sessions.map((session, index) => (
                            <tr key={session.session_id || index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {session.day}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {session.start_time} - {session.end_time}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {session.subject_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {session.professor_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {session.class_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {session.room_name}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================
                  CLASSES SECTION
              =============================*/}
              <div className="max-w-6xl mx-auto">
                <div className="max-w-4xl mx-auto text-center mb-8">
                  <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800">Classes</h1>
                  <p className="text-gray-600 mt-2">Browse and manage your classes</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  {classesList.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No classes found</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {classesList.map((cls) => (
                        <Link
                          key={cls.class_id}
                          href={`/department_directive/${cls.class_id}`}
                          className="group block overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100"
                        >
                          <div className="relative w-full h-44 bg-gray-100">
                            <img
                              src={cls.profile_picture || '/default.png'}
                              alt={cls.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent opacity-30"></div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                            <p className="text-sm text-blue-600 mt-1">
                              Capacity: {cls.capacity}
                            </p>
                            <p className="text-sm text-gray-600 mt-2 line-clamp-3">{cls.description}</p>
                            <div className="mt-4 flex items-center justify-between text-xs">
                              <span className="text-gray-400">Click to view details</span>
                              <span className="text-blue-600 font-medium">View</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
