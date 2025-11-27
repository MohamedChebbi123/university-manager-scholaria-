"use client";

import Studentnavbar from "../components/studentnavbar";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProfessorNavbar from "../components/professornavbar";

interface Event {
  event_id: number;
  event_name: string;
  posted_at: string;
  ends_at: string;
  details: string;
  event_type: string;
}

export default function UserEventPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [role, setRole] = useState<string | null>(() => {
    try {
      return localStorage.getItem("role");
    } catch {
      return null;
    }
  });


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:8000/fetch_events", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setEvents(data.events);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events based on selected type
  const filteredEvents = filterType === "all" 
    ? events 
    : events.filter(event => event.event_type.toLowerCase() === filterType.toLowerCase());

  return (
    <>
      {role==="student" &&<Studentnavbar />}
      {role==="professor" &&<ProfessorNavbar/>}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-10 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-3">Events</h1>
            <p className="text-gray-600 text-lg">Discover and register for upcoming events</p>
          </div>

          {/* Filter Section */}
          <div className="mb-8 flex justify-center">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 inline-flex items-center gap-4">
              <label htmlFor="eventFilter" className="text-gray-700 font-semibold">
                Filter by Type:
              </label>
              <select
                id="eventFilter"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 cursor-pointer"
              >
                <option value="all">All Events</option>
                <option value="academic">Academic</option>
                <option value="sports">Sports</option>
                <option value="cultural">Cultural</option>
                <option value="workshop">Workshop</option>
                <option value="conference">Conference</option>
                <option value="exam">Exam</option>
                <option value="holiday">Holiday</option>
              </select>
            </div>
          </div>
        
          {loading && (
            <div className="text-center py-16">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-700">Loading events...</p>
            </div>
          )}

          {error && (
            <div className="bg-white border border-red-300 text-red-700 px-6 py-4 rounded-xl shadow-md mb-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {!loading && !error && filteredEvents.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 max-w-md mx-auto">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 text-lg">
                  {filterType === "all" ? "No events available" : `No ${filterType} events available`}
                </p>
              </div>
            </div>
          )}

          {!loading && !error && filteredEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Link
                  key={event.event_id}
                  href={`/user_event/${event.event_id}`}
                  className="group bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {event.event_name}
                    </h2>
                    <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
                      {event.event_type}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-6 line-clamp-3">{event.details}</p>
                  
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium text-gray-700">Posted:</span>
                      <span className="text-gray-600">{new Date(event.posted_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-gray-700">Ends:</span>
                      <span className="text-gray-600">{new Date(event.ends_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}