'use client'
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Studentnavbar from "../../components/studentnavbar"

interface SessionDetail {
  session_id: number
  class_id: number
  room_id: number
  room_name: string | null
  professor_id: number
  professor_name: string | null
  subject_id: number
  subject_name: string | null
  start_time: string
  end_time: string
  day: string
}

interface AbsenceInfo {
  session_id: number
  class_id: number
  class_name: string
  subject: string
  professor_name: string
  room_name: string
  day: string
  start_time: string
  end_time: string
  absence_status: "recorded" | "not_recorded"
  is_absent: boolean | null
  date: string | null
  absence_id?: number
  message?: string
}

interface AbsenceRecord {
  absence_id: number
  is_absent: boolean
  date: string | null
  recorded_at: string
}

interface StudentAbsenceHistory {
  session_id: number
  class_id: number
  class_name: string
  subject: string
  professor: string
  room: string
  day: string
  start_time: string
  end_time: string
  student_name: string
  total_records: number
  total_absences: number
  total_present: number
  absence_history: AbsenceRecord[]
}

export default function SessionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const session_id = params?.session_id as string
  
  const [role, setRole] = useState<string>("")
  const [session, setSession] = useState<SessionDetail | null>(null)
  const [absenceInfo, setAbsenceInfo] = useState<AbsenceInfo | null>(null)
  const [absenceHistory, setAbsenceHistory] = useState<StudentAbsenceHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  
  // Absence demand form state
  const [showDemandForm, setShowDemandForm] = useState(false)
  const [demandReason, setDemandReason] = useState("")
  const [demandDocument, setDemandDocument] = useState<File | null>(null)
  const [submittingDemand, setSubmittingDemand] = useState(false)
  const [demandError, setDemandError] = useState("")
  const [demandSuccess, setDemandSuccess] = useState("")

  useEffect(() => {
    const fetchSessionDetail = async () => {
      const token = localStorage.getItem("token")
      const storedRole = localStorage.getItem("role")

      if (!token) return router.push("/UserLogin")
      setRole(storedRole || "")

      try {
        const response = await fetch(`https://university-manager-scholaria-6.onrender.com/fetch_single_session_for_student/${session_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        
        if (!response.ok) throw new Error("Failed to fetch session details")
        
        const data: SessionDetail = await response.json()
        setSession(data)

        // Fetch absence information
        const absenceResponse = await fetch(
          `https://university-manager-scholaria-6.onrender.com/absences/class_for_student/${data.class_id}/session/${session_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        if (absenceResponse.ok) {
          const absenceData: AbsenceInfo = await absenceResponse.json()
          setAbsenceInfo(absenceData)
        }

        // Fetch student's own absence history for this session
        const historyResponse = await fetch(
          `https://university-manager-scholaria-6.onrender.com/student_absence_history/${session_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        if (historyResponse.ok) {
          const historyData: StudentAbsenceHistory = await historyResponse.json()
          setAbsenceHistory(historyData)
        }
      } catch (err) {
        console.error(err)
        setError("Unable to fetch session details")
      } finally {
        setLoading(false)
      }
    }

    if (session_id) {
      fetchSessionDetail()
    }
  }, [session_id, router])

  const handleSubmitDemand = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!absenceInfo?.absence_id) {
      setDemandError("No absence ID found")
      return
    }

    if (!demandReason.trim()) {
      setDemandError("Please provide a reason")
      return
    }

    if (!demandDocument) {
      setDemandError("Please upload a document")
      return
    }

    setSubmittingDemand(true)
    setDemandError("")
    setDemandSuccess("")

    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("reason", demandReason)
      formData.append("document", demandDocument)
      formData.append("absence_id", absenceInfo.absence_id.toString())

      const response = await fetch("https://university-manager-scholaria-6.onrender.com/demand_absence", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to submit absence demand")
      }

      const result = await response.json()
      setDemandSuccess(result.msg || "Absence demand submitted successfully!")
      
      // Reset form
      setDemandReason("")
      setDemandDocument(null)
      
      // Close form after 2 seconds
      setTimeout(() => {
        setShowDemandForm(false)
        setDemandSuccess("")
      }, 2000)
    } catch (err: any) {
      console.error(err)
      setDemandError(err.message || "Failed to submit demand")
    } finally {
      setSubmittingDemand(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDemandDocument(e.target.files[0])
    }
  }

  if (loading) {
    return (
      <>
        {role === "student" && <Studentnavbar />}
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10 px-4">
          <div className="py-16 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Loading session details...</p>
          </div>
        </div>
      </>
    )
  }

  if (error || !session) {
    return (
      <>
        {role === "student" && <Studentnavbar />}
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-10 px-4">
          <div className="max-w-2xl mx-auto mt-16 text-center">
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Session</h2>
              <p className="text-gray-600">{error || "Session not found"}</p>
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
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push("/Student_class")}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors mb-4"
            >
              <span>←</span>
              <span>Back to Schedule</span>
            </button>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800">
              Session Details
            </h1>
          </div>

          {/* Session Detail Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">Session Information</h2>
              </div>
              <p className="text-blue-100 text-sm">Session ID: {session.session_id}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Absence Status Banner */}
              {absenceInfo && (
                <div className={`rounded-lg p-5 border-2 ${
                  absenceInfo.absence_status === "not_recorded"
                    ? "bg-gray-50 border-gray-300"
                    : absenceInfo.is_absent
                    ? "bg-red-50 border-red-300"
                    : "bg-green-50 border-green-300"
                }`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-1 ${
                        absenceInfo.absence_status === "not_recorded"
                          ? "text-gray-800"
                          : absenceInfo.is_absent
                          ? "text-red-800"
                          : "text-green-800"
                      }`}>
                        {absenceInfo.absence_status === "not_recorded"
                          ? "Attendance Not Recorded"
                          : absenceInfo.is_absent
                          ? "Marked as Absent"
                          : "Marked as Present"}
                      </h3>
                      <p className={`text-sm ${
                        absenceInfo.absence_status === "not_recorded"
                          ? "text-gray-600"
                          : absenceInfo.is_absent
                          ? "text-red-700"
                          : "text-green-700"
                      }`}>
                        {absenceInfo.absence_status === "not_recorded"
                          ? absenceInfo.message || "The professor has not taken attendance for this session yet."
                          : absenceInfo.is_absent
                          ? `You were marked absent on ${absenceInfo.date ? new Date(absenceInfo.date).toLocaleDateString() : "this session"}.`
                          : `You were marked present on ${absenceInfo.date ? new Date(absenceInfo.date).toLocaleDateString() : "this session"}.`}
                      </p>
                      
                      {/* Request Absence Revocation Button */}
                      {absenceInfo.is_absent && absenceInfo.absence_id && (
                        <button
                          onClick={() => setShowDemandForm(true)}
                          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                        >
                          Request Absence Revocation
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Session Details */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Session Details</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800">Subject</h3>
                    </div>
                    <p className="text-lg text-gray-700">{absenceInfo?.subject || session.subject_name || "N/A"}</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800">Class</h3>
                    </div>
                    <p className="text-lg text-gray-700">{absenceInfo?.class_name || `Class ${session.class_id}`}</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-teal-50 border border-green-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800">Professor</h3>
                    </div>
                    <p className="text-lg text-gray-700">{absenceInfo?.professor_name || session.professor_name || "N/A"}</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800">Room</h3>
                    </div>
                    <p className="text-lg text-gray-700">{absenceInfo?.room_name || session.room_name || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Time Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800">Day</h3>
                  </div>
                  <p className="text-lg text-gray-700">{absenceInfo?.day || session.day}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800">Time</h3>
                  </div>
                  <p className="text-lg text-gray-700">{absenceInfo?.start_time || session.start_time} - {absenceInfo?.end_time || session.end_time}</p>
                </div>
              </div>

              {/* IDs Information */}
              <div className="grid md:grid-cols-2 gap-4">
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => router.push("/Student_class")}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Back to Schedule
              </button>
            </div>
          </div>

          {/* Student's Absence History Section */}
          {absenceHistory && absenceHistory.absence_history.length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">Your Attendance History</h2>
                </div>
                <p className="text-sm text-blue-100 mb-3">
                  All your attendance records for this session
                </p>
                <div className="flex gap-6 text-sm">
                  <span>Total Records: {absenceHistory.total_records}</span>
                  <span className="text-green-300">Present: {absenceHistory.total_present}</span>
                  <span className="text-red-300">Absent: {absenceHistory.total_absences}</span>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  {absenceHistory.absence_history.map((record) => (
                    <div
                      key={record.absence_id}
                      className={`border-2 rounded-lg p-4 flex items-center justify-between ${
                        record.is_absent
                          ? "border-red-200 bg-red-50"
                          : "border-green-200 bg-green-50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className={`text-lg font-bold ${
                            record.is_absent ? "text-red-800" : "text-green-800"
                          }`}>
                            {record.is_absent ? "Marked Absent" : "Marked Present"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {record.recorded_at}
                          </p>
                          {record.date && (
                            <p className="text-xs text-gray-500 mt-1">
                              Recorded on: {new Date(record.date).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
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
                            onClick={() => {
                              // Find the absence info with this ID
                              if (absenceInfo?.absence_id === record.absence_id) {
                                setShowDemandForm(true)
                              }
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
                          >
                            Request Revocation
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* No Attendance History Message */}
          {absenceHistory && absenceHistory.absence_history.length === 0 && (
            <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Attendance Records
                </h3>
                <p className="text-gray-600">
                  The professor hasn't taken attendance for this session yet.
                </p>
              </div>
            </div>
          )}

          {/* Absence Demand Modal */}
          {showDemandForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Request Absence Revocation</h2>
                  <button
                    onClick={() => {
                      setShowDemandForm(false)
                      setDemandError("")
                      setDemandSuccess("")
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {demandSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded-lg text-green-700 text-sm">
                    {demandSuccess}
                  </div>
                )}

                {demandError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">
                    {demandError}
                  </div>
                )}

                <form onSubmit={handleSubmitDemand} className="space-y-4">
                  {/* Absence ID Display */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Absence ID
                    </label>
                    <input
                      type="text"
                      value={absenceInfo?.absence_id || ""}
                      disabled
                      className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                    />
                  </div>

                  {/* Reason Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Reason for Revocation <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={demandReason}
                      onChange={(e) => setDemandReason(e.target.value)}
                      placeholder="Explain why you were absent and why this absence should be revoked..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      required
                    />
                  </div>

                  {/* Document Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Supporting Document <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        className="hidden"
                        id="document-upload"
                        required
                      />
                      <label
                        htmlFor="document-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <span className="text-sm text-gray-600">
                          {demandDocument ? demandDocument.name : "Click to upload document"}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          PDF, JPG, PNG, DOC, DOCX
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDemandForm(false)
                        setDemandError("")
                        setDemandSuccess("")
                      }}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                      disabled={submittingDemand}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={submittingDemand}
                    >
                      {submittingDemand ? "Submitting..." : "Submit Request"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}