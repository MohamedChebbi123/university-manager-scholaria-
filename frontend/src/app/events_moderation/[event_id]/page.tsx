"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Adminstrativenavbar from "@/app/components/adminstrativenavbar";

interface Event {
  event_id: number;
  event_name: string;
  posted_at: string;
  ends_at: string;
  details: string;
  event_type: string;
}

interface Attendee {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  profile_picture: string | null;
}

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const event_id = params.event_id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<Event | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [attendeesError, setAttendeesError] = useState<string | null>(null);
  const [totalAttendees, setTotalAttendees] = useState(0);

  useEffect(() => {
    fetchEvent();
    fetchAttendees();
  }, [event_id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`https://university-manager-scholaria-6.onrender.com/fetch_event/${event_id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch event");
      }

      setEvent(data);
      setEditFormData(data);
    } catch (err) {
      console.error("Error fetching event:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendees = async () => {
    try {
      setAttendeesLoading(true);
      setAttendeesError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`https://university-manager-scholaria-6.onrender.com/event_attendees/${event_id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch attendees");
      }

      setAttendees(data.attendees || []);
      setTotalAttendees(data.total_attendees || 0);
    } catch (err) {
      console.error("Error fetching attendees:", err);
      setAttendeesError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setAttendeesLoading(false);
    }
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => prev ? ({ ...prev, [name]: value }) : null);
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;

    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const updateData = {
        event_name: editFormData.event_name,
        ends_at: new Date(editFormData.ends_at).toISOString().split("T")[0],
        details: editFormData.details,
        event_type: editFormData.event_type,
      };

      const response = await fetch(`https://university-manager-scholaria-6.onrender.com/update_event/${event_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update event");
      }

      setUpdateSuccess("Event updated successfully!");
      setEvent(data);
      setEditFormData(data);
      
      setTimeout(() => {
        setIsEditMode(false);
        setUpdateSuccess(null);
      }, 2000);
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    setDeleteLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`https://university-manager-scholaria-6.onrender.com/delete_event/${event_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete event");
      }

      // Redirect to events list after successful deletion
      router.push("/events_moderation");
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "An error occurred");
      setShowDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Adminstrativenavbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Events
          </button>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-red-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Event</h3>
              <p className="text-red-600">{error}</p>
            </div>
          ) : event ? (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {event.event_name}
                    </h1>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 text-white capitalize">
                      {event.event_type}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-sm">Event ID</p>
                    <p className="text-white font-semibold text-lg">#{event.event_id}</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {!isEditMode ? (
                  <>
                    <div className="flex justify-end gap-3 mb-4">
                      <button
                        onClick={() => setIsEditMode(true)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Event
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Event
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <svg
                            className="w-6 h-6 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Posted Date</p>
                          <p className="text-lg text-gray-900">{formatDate(event.posted_at)}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <svg
                            className="w-6 h-6 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">End Date</p>
                          <p className="text-lg text-gray-900">{formatDate(event.ends_at)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Details</h2>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {event.details}
                        </p>
                      </div>
                    </div>

                    {/* Attendees Section */}
                    <div className="border-t border-gray-200 pt-6 mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Registered Attendees</h2>
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                          {totalAttendees} {totalAttendees === 1 ? 'Attendee' : 'Attendees'}
                        </span>
                      </div>

                      {attendeesLoading ? (
                        <div className="flex justify-center items-center py-10">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        </div>
                      ) : attendeesError ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-red-600 text-sm">{attendeesError}</p>
                        </div>
                      ) : attendees.length === 0 ? (
                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p className="text-gray-500 font-medium">No attendees registered yet</p>
                          <p className="text-gray-400 text-sm mt-1">Users will appear here when they register for this event</p>
                        </div>
                      ) : (
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User ID
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {attendees.map((attendee) => (
                                  <tr key={attendee.user_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-blue-100">
                                          {attendee.profile_picture ? (
                                            <img
                                              src={attendee.profile_picture}
                                              alt={`${attendee.first_name} ${attendee.last_name}`}
                                              className="h-full w-full object-cover"
                                            />
                                          ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                              <span className="text-blue-600 font-semibold">
                                                {attendee.first_name.charAt(0)}{attendee.last_name.charAt(0)}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                        <div className="ml-4">
                                          <div className="text-sm font-medium text-gray-900">
                                            {attendee.first_name} {attendee.last_name}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">{attendee.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                                        {attendee.role}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {attendee.user_id}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleUpdateEvent} className="space-y-6">
                    {updateError && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-800">{updateError}</p>
                      </div>
                    )}

                    {updateSuccess && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-800">{updateSuccess}</p>
                      </div>
                    )}

                    <div>
                      <label htmlFor="event_name" className="block text-sm font-medium text-gray-700 mb-2">
                        Event Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="event_name"
                        name="event_name"
                        value={editFormData?.event_name || ""}
                        onChange={handleEditInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="event_type" className="block text-sm font-medium text-gray-700 mb-2">
                        Event Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="event_type"
                        name="event_type"
                        value={editFormData?.event_type || ""}
                        onChange={handleEditInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="academic">Academic</option>
                        <option value="sports">Sports</option>
                        <option value="cultural">Cultural</option>
                        <option value="workshop">Workshop</option>
                        <option value="conference">Conference</option>
                        <option value="exam">Exam</option>
                        <option value="holiday">Holiday</option>
                        <option value="general">General</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="ends_at" className="block text-sm font-medium text-gray-700 mb-2">
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="ends_at"
                        name="ends_at"
                        value={editFormData?.ends_at ? new Date(editFormData.ends_at).toISOString().split("T")[0] : ""}
                        onChange={handleEditInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-2">
                        Event Details <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="details"
                        name="details"
                        value={editFormData?.details || ""}
                        onChange={handleEditInputChange}
                        required
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={updateLoading}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {updateLoading ? "Updating..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditMode(false);
                          setEditFormData(event);
                          setUpdateError(null);
                          setUpdateSuccess(null);
                        }}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Delete Event</h3>
                <p className="text-sm text-gray-500">Are you sure you want to delete this event?</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              This action cannot be undone. The event &quot;<strong>{event?.event_name}</strong>&quot; will be permanently deleted.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteEvent}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}