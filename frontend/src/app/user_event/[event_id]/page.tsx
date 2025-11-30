"use client";

import Studentnavbar from "@/app/components/studentnavbar";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProfessorNavbar from "@/app/components/professornavbar";

interface Event {
  event_id: number;
  event_name: string;
  posted_at: string;
  ends_at: string;
  details: string;
  event_type: string;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const event_id = params.event_id;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(() => {
    try {
      return localStorage.getItem("role");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:8000/fetch_event/${event_id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Event not found");
          }
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setEvent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch event");
      } finally {
        setLoading(false);
      }
    };

    if (event_id) {
      fetchEvent();
    }
  }, [event_id]);

  const handleRegister = async () => {
    setRegistering(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(
        `http://localhost:8000/register_event/${event_id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error: ${response.status}`);
      }

      const data = await response.json();
      setSuccessMessage(data.message);
      setIsRegistered(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register for event");
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    setRegistering(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(
        `http://localhost:8000/unregister_event/${event_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error: ${response.status}`);
      }

      const data = await response.json();
      setSuccessMessage(data.message);
      setIsRegistered(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unregister from event");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <>
      {role==="student" &&<Studentnavbar />}
      {role==="professor" &&<ProfessorNavbar/>}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-10 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/user_event"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 font-medium"
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
          </Link>

          {loading && (
            <div className="text-center py-16">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-700">Loading event...</p>
            </div>
          )}

          {error && (
            <div className="bg-white border border-red-300 text-red-700 px-6 py-4 rounded-xl shadow-lg mb-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-white border border-green-400 text-green-700 px-6 py-4 rounded-xl shadow-lg mb-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {successMessage}
              </div>
            </div>
          )}

          {!loading && !error && event && (
            <div className="bg-white shadow-2xl rounded-2xl p-10 border border-gray-200">
              <div className="flex items-start justify-between mb-8">
                <h1 className="text-5xl font-bold text-blue-600">
                  {event.event_name}
                </h1>
                <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-bold px-5 py-2 rounded-full border-2 border-blue-300">
                  {event.event_type}
                </span>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Event Details
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {event.details}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t-2 border-gray-200">
                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-6 rounded-xl border border-blue-300">
                  <div className="flex items-center mb-3">
                    <svg
                      className="w-6 h-6 text-blue-600 mr-3"
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
                    <span className="font-bold text-gray-900">Posted Date</span>
                  </div>
                  <p className="text-gray-800 text-lg font-medium">
                    {new Date(event.posted_at).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-xl border border-purple-300">
                  <div className="flex items-center mb-3">
                    <svg
                      className="w-6 h-6 text-purple-600 mr-3"
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
                    <span className="font-bold text-gray-900">End Date</span>
                  </div>
                  <p className="text-gray-800 text-lg font-medium">
                    {new Date(event.ends_at).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t-2 border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg border border-gray-300">
                  Event ID: <span className="font-mono font-semibold text-gray-900">{event.event_id}</span>
                </p>
                
                <div className="flex gap-3">
                  {!isRegistered ? (
                    <button
                      onClick={handleRegister}
                      disabled={registering}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {registering ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Registering...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Register for Event
                        </span>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleUnregister}
                      disabled={registering}
                      className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {registering ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Unregistering...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Unregister from Event
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}