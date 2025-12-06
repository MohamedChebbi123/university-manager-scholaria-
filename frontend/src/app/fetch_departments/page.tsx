'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import Adminstrativenavbar from "../components/adminstrativenavbar"

// ✅ Define the shape of your department data
interface Department {
  id: number
  department_name: string
  created_at: string
  description: string
  profile_picture?: string
}

export default function FetchDepartments() {
  const [role, setRole] = useState<string>("")
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  // 🔹 Load user role
  useEffect(() => {
    const userrole = localStorage.getItem("role")
    if (!userrole) {
      alert("You don't have a role.")
    } else {
      setRole(userrole)
    }
  }, [])

  // 🔹 Fetch departments
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    const fetchDepartments = async () => {
      try {
        const res = await fetch("https://university-manager-scholaria-6.onrender.com/fetch_all_departments", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data: Department[] = await res.json()
        setDepartments(data)
      } catch (err) {
        console.error("Error fetching departments:", err)
        alert("Failed to load departments.")
      } finally {
        setLoading(false)
      }
    }

    fetchDepartments()
  }, []) // runs once when component mounts

  // 🔹 Delete department function
  const handleDelete = async (departmentId: number) => {
    if (!confirm("Are you sure you want to delete this department? This action cannot be undone.")) {
      return
    }

    const token = localStorage.getItem("token")
    if (!token) return

    setDeleting(departmentId)

    try {
      const res = await fetch(`https://university-manager-scholaria-6.onrender.com/delete_department/${departmentId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      // Remove the deleted department from state
      setDepartments(departments.filter(dept => dept.id !== departmentId))
      alert("Department deleted successfully!")
    } catch (err) {
      console.error("Error deleting department:", err)
      alert("Failed to delete department.")
    } finally {
      setDeleting(null)
    }
  }

  return (
    <>
      <Adminstrativenavbar />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800">Departments</h1>
            <p className="text-gray-600 mt-2">Browse departments and view their details</p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {loading ? (
                <div className="py-16 text-center">
                  <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-700">Loading departments...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {departments.map((dept) => (
                    <div key={dept.id} className="group block overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
                      <Link href={`/fetch_departments/${dept.id}`}>
                        <div className="relative w-full h-44 bg-gray-100">
                          <img
                            src={dept.profile_picture || '/default.png'}
                            alt={dept.department_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent opacity-30"></div>
                        </div>
                      </Link>
                      <div className="p-4">
                        <Link href={`/fetch_departments/${dept.id}`}>
                          <h2 className="text-lg font-semibold text-gray-900 hover:text-blue-600">{dept.department_name}</h2>
                        </Link>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-3">{dept.description}</p>
                        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                          <span>Created: {new Date(dept.created_at).toLocaleDateString()}</span>
                          <Link href={`/fetch_departments/${dept.id}`} className="text-blue-600 font-medium hover:text-blue-700">
                            View
                          </Link>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            handleDelete(dept.id)
                          }}
                          disabled={deleting === dept.id}
                          className="mt-3 w-full py-2 px-4 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          {deleting === dept.id ? (
                            <>
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </>
                          )}
                        </button>
                      </div>
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
