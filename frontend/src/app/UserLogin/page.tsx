"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | null;
    text: string;
  }>({ type: null, text: '' });

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: null, text: '' });

    try {
      const res = await fetch("https://university-manager-scholaria-6.onrender.com/user_login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.message || "Invalid credentials" });
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("verification",data.verification);
      

      setMessage({ type: "success", text: data.message || "Login successful!" });

      
      setTimeout(() => router.push("/UserProfile"), 500);

    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
  <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-8"></div>
  <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-400 via-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-8"></div>
  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-indigo-400 via-green-400 to-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-8"></div>
        
  <div className="absolute top-20 left-20 w-24 h-24 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full opacity-08"></div>
  <div className="absolute bottom-20 right-20 w-20 h-20 bg-gradient-to-r from-pink-300 to-yellow-300 rounded-full opacity-08"></div>
  <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-gradient-to-r from-green-300 to-blue-300 rounded-full opacity-08"></div>
      </div>

      <div className="relative w-full max-w-md z-10">
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-blue-50/10 pointer-events-none"></div>
          <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-r from-pink-400/10 to-yellow-400/10 rounded-full"></div>
          
          <div className="text-center mb-10 relative z-10">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-md transform hover:scale-105 transition-transform duration-200 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-12 group-hover:opacity-18 transition-opacity"></div>
              <svg className="w-12 h-12 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Welcome Back
            </h2>
            <p className="text-gray-600">Sign in to your account</p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mt-4"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div className="group relative">
              <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-6 h-6 text-gray-400 group-focus-within:text-blue-500 group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 bg-gray-50 transition-all duration-200 placeholder-gray-500 text-gray-800 font-medium"
                  required
                />
              </div>
            </div>

            <div className="group relative">
              <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-6 h-6 text-gray-400 group-focus-within:text-blue-500 group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  placeholder="Enter your secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 bg-gray-50 transition-all duration-200 placeholder-gray-500 text-gray-800 font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 relative overflow-hidden shadow"
            >
              <div className="relative flex items-center justify-center">
                {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In to Your Account
                  </>
                )}
              </div>
            </button>

            {message.text && (
              <div className={`p-6 rounded-2xl border-l-4 mt-6 relative overflow-hidden backdrop-blur-sm transition-all duration-500 transform ${
                message.type === "error"
                  ? "bg-red-50/90 border-red-400 text-red-700 shadow-lg shadow-red-100/50"
                  : "bg-green-50/90 border-green-400 text-green-700 shadow-lg shadow-green-100/50"
              }`}>
                <div className={`absolute inset-0 opacity-10 ${
                  message.type === "error" 
                    ? "bg-gradient-to-r from-red-400 to-pink-400" 
                    : "bg-gradient-to-r from-green-400 to-teal-400"
                }`}></div>
                
                <div className="flex items-center relative z-10">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-full ${
                      message.type === "error" 
                        ? "bg-red-100 text-red-500 shadow-lg shadow-red-200/50" 
                        : "bg-green-100 text-green-500 shadow-lg shadow-green-200/50"
                    }`}>
                      {message.type === "error" ? (
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
                      {message.type === "error" ? "Authentication Failed" : "Success!"}
                    </h4>
                    <p className="text-sm font-medium opacity-90">{message.text}</p>
                  </div>
                </div>
              </div>
            )}
          </form>

          <div className="mt-10 text-center relative z-10">
            <p className="text-gray-600 text-base">
              Don't have an account?{" "}
              <button 
                onClick={() => router.push("/Userregistration")}
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all duration-200 relative group"
              >
                <span className="relative z-10">Sign up</span>
                <div className="absolute inset-0 bg-blue-100 rounded-lg opacity-0 group-hover:opacity-50 transition-opacity duration-200 -m-1"></div>
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
