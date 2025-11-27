"use client";

import { useEffect, useState } from "react";
import ProfessorNavbar from "../components/professornavbar";
import { useRouter } from "next/navigation";
import Adminstrativenavbar from "../components/adminstrativenavbar";
import Studentnavbar from "../components/studentnavbar";
import Directive_navbar from "../components/directive_navbar";

const customStyles = `
  @keyframes blob {
    0% {
      transform: translate(0px, 0px) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
      transform: translate(0px, 0px) scale(1);
    }
  }
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
`;

export default function UserProfile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState<string>("");
  const [passwordSuccess, setPasswordSuccess] = useState<string>("");
  const router = useRouter();


  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = customStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
   
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const verification=localStorage.getItem("verification")
        console.log("ahouwa",verification)
        console.log(token)
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:8000/user_profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user profile");

        const data = await res.json();
        setUser(data);
        setFormData(data);
        setRole(data.role || localStorage.getItem("role"));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (!loading && !user) router.push("/UserLogin");
  }, [loading, user, router]);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfilePictureChange = (e: any) => {
    setProfilePictureFile(e.target.files[0]);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const body = new FormData();
      
      body.append("first_name", formData.first_name || "");
      body.append("last_name", formData.last_name || "");
      body.append("email", formData.email || "");
      body.append("country", formData.country || "");
      body.append("phone_number", formData.phone_number || "");
      body.append("age", String(formData.age || ""));  
      body.append("bio", formData.bio || "");

      if (profilePictureFile) {
        body.append("profile_picture", profilePictureFile);
      }

      const res = await fetch("http://localhost:8000/edit_profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to update profile");
      }

      const updatedUser = await res.json();
      alert(updatedUser.message);
      
      const profileRes = await fetch("http://localhost:8000/user_profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (profileRes.ok) {
        const updatedData = await profileRes.json();
        setUser(updatedData);
        setFormData(updatedData);
      }
      
      setEditing(false);
      setProfilePictureFile(null); 
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 7) {
      setPasswordError("New password must be at least 7 characters");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const body = new FormData();
      body.append("old_password", passwordData.oldPassword);
      body.append("new_password", passwordData.newPassword);

      const res = await fetch("http://localhost:8000/change_password", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to change password");
      }

      const result = await res.json();
      setPasswordSuccess(result.message);
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess("");
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-12 rounded-3xl shadow-2xl">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-400 border-r-purple-400"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border border-blue-400/20"></div>
          </div>
          <div className="text-center">
            <p className="text-white text-xl font-semibold">Loading your profile</p>
            <p className="text-white/60 mt-2">Please wait a moment...</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-red-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg border border-red-300/20 p-12 rounded-3xl shadow-2xl max-w-md">
        <div className="text-center">
          <div className="bg-red-500/20 p-4 rounded-full w-fit mx-auto mb-6">
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h3>
          <p className="text-red-200 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-500/30 hover:bg-red-500/50 text-white px-6 py-3 rounded-xl backdrop-blur-sm transition-all duration-200 border border-red-400/30"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto mb-4"></div>
          </div>
          <p className="text-white text-lg font-medium">Redirecting to login...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-pink-400 via-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400 via-green-400 to-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-r from-pink-300 to-yellow-300 rounded-full opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-r from-green-300 to-blue-300 rounded-full opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {role === "professor" && <ProfessorNavbar />}
      {role==="administrative" && <Adminstrativenavbar/>}
      {role==="student" && <Studentnavbar/>}  
      {role==="director" && <Directive_navbar/>}  

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            {/* Enhanced Header */}
            <div className="h-64 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-black opacity-20"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full"></div>
              <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/10 rounded-full"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-end space-x-6">
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                    <img
                      src={profilePictureFile ? URL.createObjectURL(profilePictureFile) : user.profile_picture || "/default-avatar.png"}
                      alt="Profile"
                      className="relative w-36 h-36 rounded-full border-4 border-white shadow-2xl object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                    {editing && (
                      <label htmlFor="profile-pic" className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg transform hover:scale-110">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input
                          id="profile-pic"
                          type="file"
                          onChange={handleProfilePictureChange}
                          className="hidden"
                          accept="image/*"
                        />
                      </label>
                    )}
                  </div>
                  <div className="text-white pb-6">
                    <h2 className="text-3xl font-bold mb-2">{user.first_name} {user.last_name}</h2>
                    <p className="text-blue-100 text-lg mb-3">{user.email}</p>
                    <div className="flex items-center space-x-3">
                      <span className="inline-block px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold border border-white/20">
                        {user.role}
                      </span>
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              {!editing ? (
                <>
                  {/* Profile Info Grid */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Contact Information</h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-700">{user.email}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-gray-700">{user.phone_number}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Personal Details</h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-gray-700">{user.country}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M4 7v13a1 1 0 001 1h14a1 1 0 001-1V7H4zM8 11h8" />
                            </svg>
                            <span className="text-gray-700">Age: {user.age}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">About</h3>
                        <p className="text-gray-700 leading-relaxed">
                          {user.bio || "No bio available yet."}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Member Since</h3>
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M4 7v13a1 1 0 001 1h14a1 1 0 001-1V7H4z" />
                          </svg>
                          <span className="text-gray-700">{new Date(user.joined_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setEditing(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </button>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      Change Password
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-8">
                    <div className="text-center mb-8">
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Edit Profile</h3>
                      <p className="text-gray-600 text-lg">Update your personal information and preferences</p>
                      <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mt-4"></div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="group">
                        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">First Name</label>
                        <div className="relative">
                          <input
                            name="first_name"
                            value={formData.first_name || ""}
                            onChange={handleChange}
                            placeholder="Enter your first name"
                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                          />
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="group">
                        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Last Name</label>
                        <div className="relative">
                          <input
                            name="last_name"
                            value={formData.last_name || ""}
                            onChange={handleChange}
                            placeholder="Enter your last name"
                            className="w-full px-5 py-4 pl-12 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                          />
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="group">
                        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Email</label>
                        <div className="relative">
                          <input
                            name="email"
                            value={formData.email || ""}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className="w-full px-5 py-4 pl-12 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                          />
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="group">
                        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Phone Number</label>
                        <div className="relative">
                          <input
                            name="phone_number"
                            value={formData.phone_number || ""}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            className="w-full px-5 py-4 pl-12 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                          />
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="group">
                        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Country</label>
                        <div className="relative">
                          <input
                            name="country"
                            value={formData.country || ""}
                            onChange={handleChange}
                            placeholder="Enter your country"
                            className="w-full px-5 py-4 pl-12 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                          />
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="group">
                        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Age</label>
                        <div className="relative">
                          <input
                            name="age"
                            type="number"
                            value={formData.age || ""}
                            onChange={handleChange}
                            placeholder="Enter your age"
                            className="w-full px-5 py-4 pl-12 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white group-hover:border-gray-300"
                          />
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M4 7v13a1 1 0 001 1h14a1 1 0 001-1V7H4zM8 11h8" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="group">
                        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Bio</label>
                        <div className="relative">
                          <textarea
                            name="bio"
                            value={formData.bio || ""}
                            onChange={handleChange}
                            placeholder="Tell us about yourself..."
                            rows={6}
                            className="w-full px-5 py-4 pl-12 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white resize-none group-hover:border-gray-300"
                          />
                          <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-6 mt-12">
                    <button
                      onClick={handleSave}
                      className="group bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:from-green-600 hover:via-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-green-500/25 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      <div className="relative flex items-center">
                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Changes
                      </div>
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="group bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:from-gray-500 hover:via-gray-600 hover:to-gray-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-gray-500/25 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      <div className="relative flex items-center">
                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordError("");
                setPasswordSuccess("");
                setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Change Password</h3>
              <p className="text-gray-600">Enter your current and new password</p>
            </div>

            {passwordError && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-4">
                {passwordSuccess}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300"
                  placeholder="Enter new password (min 7 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handlePasswordChange}
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Change Password
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError("");
                  setPasswordSuccess("");
                  setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-400 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}