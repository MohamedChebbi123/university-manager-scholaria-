"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfessorNavbar from "../components/professornavbar";
import Adminstrativenavbar from "../components/adminstrativenavbar";
export default function ChooseSubject() {
  const [subject, setSubject] = useState("");
  const [roleuser, setRole] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | null;
    text: string;
  }>({ type: null, text: '' });
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  


 
    useEffect(() => {
        const token = localStorage.getItem("token");
        if(!token){
            router.push("/UserLogin")
        }else{
            setRole(localStorage.getItem("role"))
        }
    }, []);
     
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: null, text: '' });
    setLoading(true);

    try {
      const token = localStorage.getItem("token"); 
      const roleuser=localStorage.getItem("role");
      setRole(roleuser)
      if (!token) {
        setMessage({ 
          type: "error", 
          text: "You must be logged in." 
        });
        setLoading(false);
        return;
      }
      
      const res = await fetch("http://127.0.0.1:8000/choose_subject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setMessage({
          type: "error",
          text: errData.detail || "Something went wrong"
        });
        setLoading(false);
        return;
      }

      const data = await res.json();
      setMessage({
        type: "success",
        text: data.msg || "Subject selected successfully!"
      });
      setSubject(""); // Reset form
    } catch (err) {
      setMessage({
        type: "error",
        text: "Network error. Try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    {roleuser=="administrative" && <Adminstrativenavbar/>}
    {roleuser=="professor" && <ProfessorNavbar/>}
    
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Enhanced Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-pink-400 via-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400 via-green-400 to-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        
        {/* Additional floating elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full opacity-20"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-r from-pink-300 to-yellow-300 rounded-full opacity-20"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-r from-green-300 to-blue-300 rounded-full opacity-20"></div>
      </div>

      <div className="relative w-full max-w-lg z-10">
        <div className="bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/30 relative overflow-hidden">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-blue-50/30 pointer-events-none"></div>
          <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-r from-pink-400/20 to-yellow-400/20 rounded-full"></div>
          
          {/* Header Section */}
          <div className="text-center mb-10 relative z-10">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-50 animate-pulse group-hover:opacity-75 transition-opacity"></div>
              <svg className="w-12 h-12 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-3">
              Choose Your Subject
            </h2>
            <p className="text-gray-600 text-lg font-medium">Select the subject you want to teach or manage</p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mt-4"></div>
          </div>

          {/* Enhanced Message Display */}
          {message.type && (
            <div className={`p-6 rounded-2xl border-l-4 mb-8 relative overflow-hidden backdrop-blur-sm transition-all duration-500 transform ${
              message.type === 'error' 
                ? 'bg-red-50/90 border-red-400 text-red-700 shadow-lg shadow-red-100/50'
                : 'bg-green-50/90 border-green-400 text-green-700 shadow-lg shadow-green-100/50'
            }`}>
              <div className={`absolute inset-0 opacity-10 ${
                message.type === 'error' 
                  ? 'bg-gradient-to-r from-red-400 to-pink-400' 
                  : 'bg-gradient-to-r from-green-400 to-teal-400'
              }`}></div>
              
              <div className="flex items-center relative z-10">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-full ${
                    message.type === 'error'
                      ? 'bg-red-100 text-red-500 shadow-lg shadow-red-200/50' 
                      : 'bg-green-100 text-green-500 shadow-lg shadow-green-200/50'
                  }`}>
                    {message.type === 'error' ? (
                      <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-lg mb-1">
                    {message.type === 'error' ? 'Action Failed' : 'Success!'}
                  </h4>
                  <p className="text-sm font-medium opacity-90">{message.text}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="group relative">
              <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                Subject Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-6 h-6 text-gray-400 group-focus-within:text-blue-500 group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Enter the subject name (e.g., Mathematics, Science, History)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-gray-50/50 backdrop-blur-sm transition-all duration-300 placeholder-gray-500 text-gray-800 font-medium group-hover:border-gray-300 focus:bg-white hover:shadow-lg focus:shadow-xl"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !subject.trim()}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-400 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none focus:outline-none focus:ring-4 focus:ring-blue-200 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-50 group-focus:opacity-50 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Select Subject
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-10 text-center relative z-10">
            <p className="text-gray-600 text-base">
              Want to go back?{" "}
              <button 
                onClick={() => router.push("/UserProfile")}
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all duration-200 relative group"
              >
                <span className="relative z-10">Return to Profile</span>
                <div className="absolute inset-0 bg-blue-100 rounded-lg opacity-0 group-hover:opacity-50 transition-opacity duration-200 -m-1"></div>
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
