"use client";

import Studentnavbar from "../components/studentnavbar";
import ProfessorNavbar from "../components/professornavbar";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Event {
  event_id: number;
  event_name: string;
  posted_at: string;
  ends_at: string;
  details: string;
  event_type: string;
}

export default function MyEventsPage() {
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
    const fetchMyEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:8000/my_events", {
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
        setError(err instanceof Error ? err.message : "Failed to fetch your events");
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

  // Filter events based on selected type
  const filteredEvents = filterType === "all" 
    ? events 
    : events.filter(event => event.event_type.toLowerCase() === filterType.toLowerCase());

  return (
    <>
      {role==="student" &&<Studentnavbar />}
      {role==="professor" &&<ProfessorNavbar/>}
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Registered Events</h1>
          <Link
            href="/user_event"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Browse All Events
          </Link>
        </div>

        {/* Filter Section */}
        <div className="mb-6 flex justify-center">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 inline-flex items-center gap-4">
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
          <div className="text-center py-8">
            <p className="text-gray-600">Loading your events...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && !error && filteredEvents.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
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
            <p className="text-gray-600 text-lg mb-4">
              {filterType === "all" ? "You haven't registered for any events yet" : `You haven't registered for any ${filterType} events`}
            </p>
            <Link
              href="/user_event"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Explore available events
            </Link>
          </div>
        )}

        {!loading && !error && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Link
                key={event.event_id}
                href={`/user_event/${event.event_id}`}
                className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow cursor-pointer relative"
              >
                <div className="absolute top-4 right-4">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Registered
                  </span>
                </div>
                
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-xl font-semibold text-gray-800 pr-20">
                    {event.event_name}
                  </h2>
                </div>
                
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded inline-block mb-3">
                  {event.event_type}
                </span>
                
                <p className="text-gray-600 mb-4 line-clamp-3">{event.details}</p>
                
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Posted:</span>
                    <span>{new Date(event.posted_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Ends:</span>
                    <span>{new Date(event.ends_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
