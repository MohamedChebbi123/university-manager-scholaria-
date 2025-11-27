"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Adminstrativenavbar() {
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:8000/user_profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/UserLogin";
  };

  return (
    <nav className="bg-black border-b border-gray-800 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Enhanced Logo */}
          <Link href="/admin/dashboard" className="group flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Scholaria
              </h1>
              <p className="text-xs text-gray-400 font-medium tracking-wide">ADMIN PORTAL</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-2">
            <Link href="/UsersList" className="group relative px-5 py-2.5 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-2 text-gray-300 group-hover:text-white">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="font-semibold text-sm">Users List</span>
              </div>
            </Link>

            <Link href="/create_department" className="group relative px-5 py-2.5 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-2 text-gray-300 group-hover:text-white">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-semibold text-sm">Create Department</span>
              </div>
            </Link>

            <Link href="/absence_history_admin" className="group relative px-5 py-2.5 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-2 text-gray-300 group-hover:text-white">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-semibold text-sm">absence history</span>
              </div>
            </Link>

            <Link href="/events_moderation" className="group relative px-5 py-2.5 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-2 text-gray-300 group-hover:text-white">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold text-sm">Events</span>
              </div>
            </Link>

            <Link href="/add_users" className="group relative px-5 py-2.5 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-2 text-gray-300 group-hover:text-white">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="font-semibold text-sm">Add Users</span>
              </div>
            </Link>

            <Link href="/fetch_departments" className="group relative px-5 py-2.5 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-2 text-gray-300 group-hover:text-white">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="font-semibold text-sm">Departments</span>
              </div>
            </Link>

            <Link href="/message_admin" className="group relative px-5 py-2.5 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-2 text-gray-300 group-hover:text-white">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold text-sm">Messages</span>
              </div>
            </Link>
          </div>

          {/* Right Side - User Avatar & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="group flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gray-900 border border-gray-800 hover:border-gray-700"
              >
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-300"></div>
                  <img
                    src={user?.profile_picture || "/default-avatar.png"}
                    alt="Profile"
                    className="relative w-10 h-10 rounded-full border-2 border-gray-800 group-hover:border-gray-700 transition-all object-cover shadow-lg"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-black rounded-full shadow-sm"></div>
                </div>
                <div className="hidden md:block text-left">
                  <p className="font-semibold text-sm text-white">{user?.first_name || "Admin"}</p>
                  <p className="text-xs text-gray-400">Online</p>
                </div>
                <svg 
                  className={`w-4 h-4 text-gray-400 group-hover:text-white transition-all duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Enhanced Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-gradient-to-b from-gray-900 to-black backdrop-blur-xl rounded-xl shadow-2xl border border-gray-800 py-2 z-50 transform transition-all duration-200 scale-100 opacity-100">
                  {/* User Info Header */}
                  <div className="px-6 py-5 border-b border-gray-800">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-50"></div>
                        <img
                          src={user?.profile_picture || "/default-avatar.png"}
                          alt="Profile"
                          className="relative w-14 h-14 rounded-full border-2 border-gray-700 object-cover shadow-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-lg">{user?.first_name} {user?.last_name}</p>
                        <p className="text-sm text-gray-400 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      href="/UserProfile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center space-x-4 px-6 py-3 text-gray-300 hover:bg-gray-800/50 transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-semibold text-white block">View Profile</span>
                        <p className="text-xs text-gray-500">Manage your account</p>
                      </div>
                    </Link>
                    
                    <div className="border-t border-gray-800 mt-2 pt-2">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center space-x-4 px-6 py-3 text-red-400 hover:bg-red-950/30 transition-all duration-200 group w-full text-left"
                      >
                        <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-semibold text-red-400 block">Sign Out</span>
                          <p className="text-xs text-red-500/70">End your session</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            
          </div>
        </div>

        
      </div>
    </nav>
  );
}
