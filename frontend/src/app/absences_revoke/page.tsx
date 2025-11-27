'use client'
import { useEffect, useState } from "react"
import Directive_navbar from "../components/directive_navbar"

interface Student {
    user_id: number
    first_name: string
    last_name: string
    email: string
}

interface Class {
    class_id: number
    class_name: string
}

interface Session {
    session_id: number
    subject: string
    day: string
    start_time: string
    end_time: string
    professor: string
}

interface AbsenceRequest {
    demande_id: number
    reason: string
    document: string
    is_accepted: boolean
    absence_id: number
    absence_date: string
    student: Student
    class: Class
    session: Session | null
}

interface FetchRequestsResponse {
    total_requests: number
    requests: AbsenceRequest[]
}

export default function AbsencesRevoke() {
    const [requests, setRequests] = useState<AbsenceRequest[]>([])
    const [filteredRequests, setFilteredRequests] = useState<AbsenceRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<'all' | 'accepted' | 'pending'>('all')

    useEffect(() => {
        fetchRequests()
    }, [])

    useEffect(() => {
        filterRequests()
    }, [requests, statusFilter])

    const filterRequests = () => {
        if (statusFilter === 'all') {
            setFilteredRequests(requests)
        } else if (statusFilter === 'accepted') {
            setFilteredRequests(requests.filter(req => req.is_accepted))
        } else if (statusFilter === 'pending') {
            setFilteredRequests(requests.filter(req => !req.is_accepted))
        }
    }

    const fetchRequests = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            
            if (!token) {
                setError('No authentication token found')
                return
            }

            const response = await fetch('http://localhost:8000/fetch_requests', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch requests')
            }

            const data: FetchRequestsResponse = await response.json()
            setRequests(data.requests)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleAcceptRequest = async (demandeId: number) => {
        try {
            const token = localStorage.getItem('token')
            
            if (!token) {
                alert('No authentication token found')
                return
            }

            const response = await fetch(`http://localhost:8000/accept_absence/${demandeId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Failed to accept request')
            }

            const data = await response.json()
            alert(data.message || 'Request accepted successfully')
            
            // Refresh the requests list
            fetchRequests()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to accept request')
        }
    }

    const handleRejectRequest = async (demandeId: number) => {
        try {
            const token = localStorage.getItem('token')
            
            if (!token) {
                alert('No authentication token found')
                return
            }

            const confirmed = confirm('Are you sure you want to reject this request? This action cannot be undone.')
            if (!confirmed) return

            const response = await fetch(`http://localhost:8000/reject_absence/${demandeId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Failed to reject request')
            }

            const data = await response.json()
            alert(data.message || 'Request rejected successfully')
            
            // Refresh the requests list
            fetchRequests()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to reject request')
        }
    }

    return (
        <>
            <Directive_navbar />
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">Absence Revocation Requests</h1>

                {/* Filter Buttons */}
                <div className="mb-6 flex gap-2">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-4 py-2 rounded transition-colors ${
                            statusFilter === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        All ({requests.length})
                    </button>
                    <button
                        onClick={() => setStatusFilter('pending')}
                        className={`px-4 py-2 rounded transition-colors ${
                            statusFilter === 'pending'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Pending ({requests.filter(r => !r.is_accepted).length})
                    </button>
                    <button
                        onClick={() => setStatusFilter('accepted')}
                        className={`px-4 py-2 rounded transition-colors ${
                            statusFilter === 'accepted'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Accepted ({requests.filter(r => r.is_accepted).length})
                    </button>
                </div>

                {loading && (
                    <div className="text-center py-8">
                        <p className="text-gray-600">Loading requests...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {!loading && !error && requests.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-600">No absence revocation requests found</p>
                    </div>
                )}

                {!loading && !error && filteredRequests.length === 0 && requests.length > 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-600">No requests found for the selected filter</p>
                    </div>
                )}

                {!loading && !error && filteredRequests.length > 0 && (
                    <div className="space-y-4">
                        <p className="text-gray-700 mb-4">Showing {filteredRequests.length} of {requests.length} Requests</p>
                        {filteredRequests.map((request) => (
                            <div 
                                key={request.demande_id} 
                                className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Student Information */}
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">Student Information</h3>
                                        <p><span className="font-medium">Name:</span> {request.student.first_name} {request.student.last_name}</p>
                                        <p><span className="font-medium">Email:</span> {request.student.email}</p>
                                        <p><span className="font-medium">User ID:</span> {request.student.user_id}</p>
                                    </div>

                                    {/* Class Information */}
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">Class Information</h3>
                                        <p><span className="font-medium">Class:</span> {request.class.class_name}</p>
                                        <p><span className="font-medium">Class ID:</span> {request.class.class_id}</p>
                                    </div>

                                    {/* Session Information */}
                                    {request.session && (
                                        <div className="md:col-span-2">
                                            <h3 className="font-semibold text-lg mb-2">Session Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <p><span className="font-medium">Subject:</span> {request.session.subject}</p>
                                                <p><span className="font-medium">Professor:</span> {request.session.professor}</p>
                                                <p><span className="font-medium">Day:</span> {request.session.day}</p>
                                                <p><span className="font-medium">Time:</span> {request.session.start_time} - {request.session.end_time}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Absence & Request Details */}
                                    <div className="md:col-span-2">
                                        <h3 className="font-semibold text-lg mb-2">Request Details</h3>
                                        <p><span className="font-medium">Absence Date:</span> {request.absence_date}</p>
                                        <p><span className="font-medium">Reason:</span> {request.reason}</p>
                                        <p><span className="font-medium">Status:</span> 
                                            <span className={`ml-2 px-2 py-1 rounded text-sm ${
                                                request.is_accepted 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {request.is_accepted ? 'Accepted' : 'Pending'}
                                            </span>
                                        </p>
                                        {request.document && (
                                            <p>
                                                <span className="font-medium">Document:</span> 
                                                <a 
                                                    href={request.document} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="ml-2 text-blue-600 hover:underline"
                                                >
                                                    View Document
                                                </a>
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    {!request.is_accepted && (
                                        <div className="md:col-span-2 flex gap-2 mt-4">
                                            <button 
                                                onClick={() => handleAcceptRequest(request.demande_id)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                                            >
                                                Accept
                                            </button>
                                            <button 
                                                onClick={() => handleRejectRequest(request.demande_id)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}