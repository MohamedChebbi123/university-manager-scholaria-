'use client'
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Adminstrativenavbar from "@/app/components/adminstrativenavbar"
import Link from 'next/link'

interface Department {
  id: number
  department_name: string
  created_at: string
  description: string
  profile_picture?: string
}

interface Class {
  class_id: number
  name: string
  capacity: number
  profile_picture: string
  description: string
}

interface Room {
  room_id: number
  room_name: string
  type?: string
}

interface Professor {
  user_id: number
  first_name: string
  last_name: string
  email: string
}

interface Subject {
  subject_id?: number
  subject_name: string
  multiplier: number
  professor_id: number
  professor_name?: string
  department_id: number
}

interface Director {
  user_id: number
  first_name: string
  last_name: string
  email: string
  profile_picture?: string
}

export default function DepartmentPage() {
  const { id } = useParams()
  const [department, setDepartment] = useState<Department | null>(null)
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<Class[]>([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [professors, setProfessors] = useState<Professor[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [director, setDirector] = useState<Director | null>(null)
  const [loadingDirector, setLoadingDirector] = useState(false)

  // Modal state for class
  const [showClassModal, setShowClassModal] = useState(false)
  const [className, setClassName] = useState("")
  const [capacity, setCapacity] = useState(0)
  const [classDescription, setClassDescription] = useState("")
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [addingClass, setAddingClass] = useState(false)

  // Modal state for director
  const [showDirectorModal, setShowDirectorModal] = useState(false)
  const [directorFirstName, setDirectorFirstName] = useState("")
  const [directorLastName, setDirectorLastName] = useState("")
  const [directorEmail, setDirectorEmail] = useState("")
  const [directorPhone, setDirectorPhone] = useState("")
  const [directorPassword, setDirectorPassword] = useState("")
  const [addingDirector, setAddingDirector] = useState(false)

  // Modal state for room
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [roomName, setRoomName] = useState("")
  const [roomType, setRoomType] = useState("")
  const [addingRoom, setAddingRoom] = useState(false)

  // Modal state for subject
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [subjectName, setSubjectName] = useState("")
  const [multiplier, setMultiplier] = useState(1)
  const [selectedProfessorId, setSelectedProfessorId] = useState("")
  const [addingSubject, setAddingSubject] = useState(false)

  // Fetch single department
  useEffect(() => {
    if (!id) return
    const token = localStorage.getItem("token")
    if (!token) return

    const fetchDepartment = async () => {
      try {
        const res = await fetch(`https://university-manager-scholaria-6.onrender.com/fetch_single_department/${id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          },
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const data = await res.json()
        setDepartment(data)
      } catch (err) {
        console.error("Error fetching department:", err)
        alert("Failed to load department.")
      } finally {
        setLoading(false)
      }
    }
    fetchDepartment()
  }, [id])

  // Fetch classes for this department
  const fetchClasses = async () => {
    if (!id) return
    const token = localStorage.getItem("token")
    if (!token) return

    setLoadingClasses(true)
    try {
      const res = await fetch(`https://university-manager-scholaria-6.onrender.com/fetch_classes/${id}?department_id=${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        },
      })
      if (!res.ok) {
        const errorText = await res.text()
        console.error("Error response:", errorText)
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      console.log("Fetched classes:", data)
      
      if (Array.isArray(data)) {
        setClasses(data)
      } else {
        setClasses([])
      }
    } catch (err) {
      console.error("Error fetching classes:", err)
      alert("Failed to load classes: " + (err as Error).message)
    } finally {
      setLoadingClasses(false)
    }
  }

  // Fetch classes when component loads
  useEffect(() => {
    if (id) {
      fetchClasses()
    }
  }, [id])

  // Fetch rooms for this department
  const fetchRooms = async () => {
    if (!id) return
    const token = localStorage.getItem("token")
    if (!token) return

    setLoadingRooms(true)
    try {
      const res = await fetch(`https://university-manager-scholaria-6.onrender.com/fetch_single_department/${id}/fetch_rooms`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        },
      })
      if (!res.ok) {
        const errorText = await res.text()
        console.error("Error response (rooms):", errorText)
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      console.log("Fetched rooms:", data)
      if (Array.isArray(data)) {
        setRooms(data)
      } else {
        setRooms([])
      }
    } catch (err) {
      console.error("Error fetching rooms:", err)
      alert("Failed to load rooms: " + (err as Error).message)
    } finally {
      setLoadingRooms(false)
    }
  }

  // Fetch rooms when component loads
  useEffect(() => {
    if (id) fetchRooms()
  }, [id])

  // Fetch professors
  const fetchProfessors = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const res = await fetch(`https://university-manager-scholaria-6.onrender.com/fetch_professors`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        },
      })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      setProfessors(data)
    } catch (err) {
      console.error("Error fetching professors:", err)
      alert("Failed to load professors.")
    }
  }

  // Fetch director for this department
  const fetchDirector = async () => {
    if (!id) return
    const token = localStorage.getItem("token")
    if (!token) return

    setLoadingDirector(true)
    try {
      const res = await fetch(`https://university-manager-scholaria-6.onrender.com/fetch_director_department_info/${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        },
      })
      if (!res.ok) {
        setDirector(null)
        return
      }
      const data = await res.json()
      if (data.director) {
        setDirector(data.director)
      }
    } catch (err) {
      console.error("Error fetching director:", err)
      setDirector(null)
    } finally {
      setLoadingDirector(false)
    }
  }

  // Fetch subjects for this department
  const fetchSubjects = async () => {
    if (!id) return
    const token = localStorage.getItem("token")
    if (!token) return

    setLoadingSubjects(true)
    try {
      // Call backend endpoint that returns subjects with professor names
      const res = await fetch(`https://university-manager-scholaria-6.onrender.com/fetch_subjects_with_professors/${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        },
      })
      if (!res.ok) {
        setSubjects([])
        return
      }
      const data = await res.json()
      if (Array.isArray(data)) {
        // Backend returns: { subject_id, subject_name, multiplier, professor_name }
        const mapped: Subject[] = data.map((s: any) => ({
          subject_id: s.subject_id,
          subject_name: s.subject_name,
          multiplier: s.multiplier,
          professor_id: s.professor_id ?? 0,
          professor_name: s.professor_name,
          department_id: parseInt(id.toString())
        }))
        setSubjects(mapped)
      } else {
        setSubjects([])
      }
    } catch (err) {
      console.error("Error fetching subjects:", err)
      setSubjects([])
    } finally {
      setLoadingSubjects(false)
    }
  }

  
  useEffect(() => {
    if (id) {
      fetchSubjects()
      fetchProfessors()
      fetchDirector()
    }
  }, [id])

  
  const handleAddClass = async () => {
    if (!className || !capacity || !profilePicture || !id) {
      alert("Please fill all required fields")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) return

    const formData = new FormData()
    formData.append("name", className)
    formData.append("capacity", capacity.toString())
    formData.append("description", classDescription)
    formData.append("department_id", id.toString())
    formData.append("profile_picture", profilePicture)

    setAddingClass(true)
    try {
      const res = await fetch(`https://university-manager-scholaria-6.onrender.com/add_class`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      alert(data.msg)
      setShowClassModal(false)
      setClassName("")
      setCapacity(0)
      setClassDescription("")
      setProfilePicture(null)
      // Refresh classes list
      fetchClasses()
    } catch (err) {
      console.error("Error adding class:", err)
      alert("Failed to add class.")
    } finally {
      setAddingClass(false)
    }
  }

  
  const handleAddDirector = async () => {
    if (!directorFirstName || !directorLastName || !directorEmail || !directorPhone || !directorPassword || !id) {
      alert("Please fill all required fields")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) return

    setAddingDirector(true)
    try {
      const res = await fetch(`https://university-manager-scholaria-6.onrender.com/add_director?department_id=${id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          first_name: directorFirstName,
          last_name: directorLastName,
          email: directorEmail,
          phone_number: directorPhone,
          password_hashed: directorPassword
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Failed to add director")
      alert(data.message || "Director added successfully")
      setShowDirectorModal(false)
      // Reset fields
      setDirectorFirstName("")
      setDirectorLastName("")
      setDirectorEmail("")
      setDirectorPhone("")
      setDirectorPassword("")
      // Refresh director info
      fetchDirector()
    } catch (err) {
      console.error("Error adding director:", err)
      alert("Failed to add director.")
    } finally {
      setAddingDirector(false)
    }
  }

  // Handle deleting director
  const handleDeleteDirector = async () => {
    if (!id) return
    
    const confirmDelete = window.confirm("Are you sure you want to remove this director? This action cannot be undone.")
    if (!confirmDelete) return

    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const res = await fetch(`https://university-manager-scholaria-6.onrender.com/delete_director/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Failed to delete director")
      alert(data.message || "Director removed successfully")
      setDirector(null)
      // Refresh director info
      fetchDirector()
    } catch (err) {
      console.error("Error deleting director:", err)
      alert("Failed to delete director.")
    }
  }

  // Handle adding a new room
  const handleAddRoom = async () => {
    if (!roomName || !id) {
      alert("Please provide a room name")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) return

    setAddingRoom(true)
    try {
      const res = await fetch(`https://university-manager-scholaria-6.onrender.com/fetch_single_department/${id}/add_room`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ room_name: roomName, type: roomType })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || data.msg || `HTTP ${res.status}`)
      alert(data.msg || "Room added successfully")
      setShowRoomModal(false)
      setRoomName("")
      setRoomType("")
      // refresh rooms list after adding a room
      fetchRooms()
    } catch (err) {
      console.error("Error adding room:", err)
      alert((err as Error).message || "Failed to add room.")
    } finally {
      setAddingRoom(false)
    }
  }

  // Handle adding a new subject
  const handleAddSubject = async () => {
    if (!subjectName || !selectedProfessorId || !id) {
      alert("Please fill all required fields")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) return

    setAddingSubject(true)
    try {
      const res = await fetch(`https://university-manager-scholaria-6.onrender.com/add_csubject_to_department`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          subject_name: subjectName,
          multiplier: multiplier,
          professor_id: parseInt(selectedProfessorId),
          department_id: parseInt(id.toString())
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Failed to add subject")
      alert(data.msg || "Subject added successfully")
      setShowSubjectModal(false)
      setSubjectName("")
      setMultiplier(1)
      setSelectedProfessorId("")
      // Refresh subjects list
      fetchSubjects()
    } catch (err) {
      console.error("Error adding subject:", err)
      alert("Failed to add subject.")
    } finally {
      setAddingSubject(false)
    }
  }

  return (
    <>
      <Adminstrativenavbar />
      <div className="p-6">
        {loading ? (
          <p>Loading...</p>
        ) : department ? (
          <div className="max-w-6xl mx-auto border rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="md:w-1/3">
                <img src={department.profile_picture || "/default.png"} alt={department.department_name} className="w-full h-64 object-cover rounded-md shadow-md" />
              </div>
              <div className="md:w-2/3 space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-4 text-gray-800">{department.department_name}</h1>
                  <p className="text-gray-700 mb-4 text-lg leading-relaxed">{department.description}</p>
                  <p className="text-sm text-gray-500 mb-6">
                    Created at: {new Date(department.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Director Information */}
                {director && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Department Director
                      </h3>
                      <button
                        onClick={handleDeleteDirector}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Remove Director"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      {director.profile_picture && (
                        <img src={director.profile_picture} alt={`${director.first_name} ${director.last_name}`} className="w-16 h-16 rounded-full object-cover border-2 border-green-300" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {director.first_name} {director.last_name}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {director.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex gap-3 mt-6 flex-wrap">
                  <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2" onClick={() => setShowDirectorModal(true)} >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    Add Director
                  </button>
                  <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2" onClick={() => setShowClassModal(true)} >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Add Class
                  </button>
                  <button className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition-colors font-medium flex items-center gap-2" onClick={() => setShowRoomModal(true)} >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                    </svg>
                    Add Room
                  </button>
                  <button className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors font-medium flex items-center gap-2" onClick={() => setShowSubjectModal(true)} >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Add Subject
                  </button>
                </div>
              </div>
            </div>

            {/* Subjects Section */}
            <div className="mt-12">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Subjects in this Department</h2>
                <div className="flex items-center gap-3">
                  <button onClick={fetchSubjects} className="bg-gray-500 text-white px-5 py-2.5 rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center gap-2 font-medium" >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Subjects
                  </button>
                </div>
              </div>

              {loadingSubjects ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
                </div>
              ) : subjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-cols-4 gap-6">
                  {subjects.map((subject) => (
                    <div key={subject.subject_id} className="group block overflow-hidden rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 shadow-sm hover:shadow-md transition-all duration-200 border border-purple-100">
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
                          <span className="font-medium">{subject.professor_name || 'No professor assigned'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <p className="text-gray-500 text-lg font-medium mb-2">No subjects found for this department.</p>
                  <p className="text-gray-400 text-sm">Use the "Add Subject" button above to create one.</p>
                </div>
              )}
            </div>

            {/* Rooms Section */}
            <div className="mt-12">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Rooms in this Department</h2>
                <div className="flex items-center gap-3">
                  <button onClick={fetchRooms} className="bg-gray-500 text-white px-5 py-2.5 rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center gap-2 font-medium" >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Rooms
                  </button>
                </div>
              </div>

              {loadingRooms ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div>
                </div>
              ) : rooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {rooms.map((room) => (
                    <div key={room.room_id} className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                      <div className="p-6">
                        <h3 className="font-bold text-xl mb-2 text-gray-800">{room.room_name}</h3>
                        <p className="text-gray-600 text-sm mb-4">Type: {room.type || "—"}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <span className="text-xs text-gray-500 font-medium">Room ID: {room.room_id}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <p className="text-gray-500 text-lg font-medium mb-2">No rooms found for this department.</p>
                  <p className="text-gray-400 text-sm">Use the "Add Room" button above to create one.</p>
                </div>
              )}
            </div>

            {/* Classes Section */}
            <div className="mt-12">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Classes in this Department</h2>
                <button onClick={fetchClasses} className="bg-gray-500 text-white px-5 py-2.5 rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center gap-2 font-medium" >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Classes
                </button>
              </div>

              {loadingClasses ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                </div>
              ) : classes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {classes.map((cls) => (
                    <Link
                      key={cls.class_id}
                      href={`/fetch_departments/${id}/single_class/${cls.class_id}`}
                      className="block"
                    >
                      <div className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:transform hover:-translate-y-1 cursor-pointer">
                        <div className="relative h-48 overflow-hidden">
                          <img src={cls.profile_picture || "/default.png"} alt={cls.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute top-4 right-4">
                            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                              {cls.capacity} Students
                            </span>
                          </div>
                          <div className="absolute top-4 left-4">
                            <span className="bg-gray-700 text-white px-2 py-1 rounded text-xs font-medium">
                              ID: {cls.class_id}
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="font-bold text-xl mb-3 text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {cls.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                            {cls.description}
                          </p>
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <span className="text-xs text-gray-500 font-medium">
                              Class ID: {cls.class_id}
                            </span>
                            <div className="text-blue-500 hover:text-blue-700 text-sm font-medium hover:underline flex items-center gap-1 transition-colors">
                              View Details
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 text-xl font-medium mb-2">No classes found for this department.</p>
                  <p className="text-gray-400 text-base">Add your first class to get started!</p>
                  <button onClick={() => setShowClassModal(true)} className="mt-6 bg-blue-500 text-white px-6 py-2.5 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2 mx-auto" >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Add First Class
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">Department not found.</p>
          </div>
        )}
      </div>

      {/* Modal: Add Class */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Class</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name *</label>
                <input type="text" placeholder="Enter class name" value={className} onChange={(e) => setClassName(e.target.value)} className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                <input type="number" placeholder="Enter student capacity" value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value))} className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea placeholder="Enter class description" value={classDescription} onChange={(e) => setClassDescription(e.target.value)} rows={3} className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture *</label>
                <input type="file" accept="image/*" onChange={(e) => setProfilePicture(e.target.files?.[0] || null)} className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setShowClassModal(false)} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium" >
                Cancel
              </button>
              <button onClick={handleAddClass} disabled={addingClass} className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2" >
                {addingClass ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Class
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Director */}
      {showDirectorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Director</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input type="text" placeholder="First name" value={directorFirstName} onChange={(e) => setDirectorFirstName(e.target.value)} className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input type="text" placeholder="Last name" value={directorLastName} onChange={(e) => setDirectorLastName(e.target.value)} className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" placeholder="Email address" value={directorEmail} onChange={(e) => setDirectorEmail(e.target.value)} className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input type="text" placeholder="Phone number" value={directorPhone} onChange={(e) => setDirectorPhone(e.target.value)} className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input type="password" placeholder="Password" value={directorPassword} onChange={(e) => setDirectorPassword(e.target.value)} className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setShowDirectorModal(false)} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium" >
                Cancel
              </button>
              <button onClick={handleAddDirector} disabled={addingDirector} className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2" >
                {addingDirector ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    Add Director
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Room */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Room</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Name *</label>
                <input type="text" placeholder="Enter room name" value={roomName} onChange={(e) => setRoomName(e.target.value)} className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type *</label>
                <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer bg-white">
                  <option value="">Select Room Type</option>
                  <option value="lab">Lab</option>
                  <option value="amphi">Amphi</option>
                  <option value="classe">Classe</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setShowRoomModal(false)} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium" >
                Cancel
              </button>
              <button onClick={handleAddRoom} disabled={addingRoom} className="px-6 py-2.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2" >
                {addingRoom ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Room
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Subject */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Subject</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name *</label>
                <input type="text" placeholder="Enter subject name" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Multiplier</label>
                <input type="number" step="0.1" placeholder="Enter multiplier" value={multiplier} onChange={(e) => setMultiplier(parseFloat(e.target.value))} className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professor *</label>
                <select value={selectedProfessorId} onChange={(e) => setSelectedProfessorId(e.target.value)} className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option value="">Select a professor</option>
                  {professors.map((professor) => (
                    <option key={professor.user_id} value={professor.user_id}>
                      {professor.first_name} {professor.last_name} ({professor.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setShowSubjectModal(false)} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium" >
                Cancel
              </button>
              <button onClick={handleAddSubject} disabled={addingSubject} className="px-6 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2" >
                {addingSubject ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Subject
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}