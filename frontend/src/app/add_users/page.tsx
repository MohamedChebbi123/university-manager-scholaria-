"use client";

import { useState, useEffect } from "react";
import Adminstrativenavbar from "../components/adminstrativenavbar";

export default function AddUsersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const roleuser = localStorage.getItem("role");
    if (roleuser) {
      setRole(roleuser);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a CSV file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setMessage("");
      const token = localStorage.getItem("token");
      if (!token) {
        alert("bara a3ml login");
        return;
      }

      const response = await fetch("https://university-manager-scholaria-6.onrender.com/add_users", {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to upload users");
      }

      const data = await response.json();
      setMessage(data.msg);
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {role === "administrative" && <Adminstrativenavbar />}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-pink-400 via-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400 via-green-400 to-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full opacity-20"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-r from-pink-300 to-yellow-300 rounded-full opacity-20"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-r from-green-300 to-blue-300 rounded-full opacity-20"></div>
        </div>

        <div className="relative w-full max-w-lg z-10">
          <div className="bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/30 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-blue-50/30 pointer-events-none"></div>
            <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-r from-pink-400/20 to-yellow-400/20 rounded-full"></div>
            
            {/* Header */}
            <div className="text-center mb-10 relative z-10">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-50 animate-pulse group-hover:opacity-75 transition-opacity"></div>
                <svg className="w-12 h-12 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-3">
                Add Users
              </h1>
              <p className="text-gray-600 text-lg font-medium">Upload CSV file to add multiple users at once</p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mt-4"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="group relative">
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  Select CSV File
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-6 h-6 text-gray-400 group-focus-within:text-blue-500 group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-gray-50/50 backdrop-blur-sm transition-all duration-300 text-gray-800 font-medium group-hover:border-gray-300 focus:bg-white hover:shadow-lg focus:shadow-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-purple-600 file:text-white hover:file:from-blue-600 hover:file:to-purple-700 file:transition-all file:duration-300"
                    required
                  />
                </div>
                {file && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-green-700 font-medium">{file.name}</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !file}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl hover:shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Uploading CSV...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>Upload CSV File</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Message Display */}
            {message && (
              <div className={`mt-6 p-4 rounded-2xl border relative z-10 ${
                message.includes('❌') || message.toLowerCase().includes('error')
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-green-50 border-green-200 text-green-700'
              }`}>
                <div className="flex items-center space-x-2">
                  {message.includes('❌') || message.toLowerCase().includes('error') ? (
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span className="font-medium">{message}</span>
                </div>
              </div>
            )}

         
           
          </div>
        </div>
      </div>
    </>
  );
}
