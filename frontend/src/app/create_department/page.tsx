"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Adminstrativenavbar from "../components/adminstrativenavbar";
export default function CreateDepartment() {
  const [deptName, setDeptName] = useState("");
  const [description, setDescription] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("");

  const router = useRouter();

  
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (!storedToken) {
      router.push("/UserLogin"); 
    } else {
      setRole(storedRole || "");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!deptName || !description || !profilePicture) {
      setMessage("All fields are required.");
      return;
    }

    const formData = new FormData();
    formData.append("dept_name", deptName);
    formData.append("description", description);
    formData.append("profile_picture", profilePicture);

    try {
      const token = localStorage.getItem("token"); 

      const res = await fetch("http://localhost:8000/add_a_department", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Something went wrong");
      }

      setMessage(data.message);
      setDeptName("");
      setDescription("");
      setProfilePicture(null);
    } catch (err) {
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage("An unexpected error occurred.");
      }
    }
  };

  return (
    <>
    {role=="administrative" && <Adminstrativenavbar/>}
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-md z-10">
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/30">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-full mx-auto mb-3 flex items-center justify-center shadow-2xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v4a1 1 0 001 1h3l3 3v-4a1 1 0 011-1h3l3 3V8a1 1 0 00-1-1H4a1 1 0 00-1 1z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800">Create Department</h2>
            <p className="text-sm text-gray-600 mt-2">Add a new department with a name, description and image</p>
          </div>

          {/* Optional: block if not admin */}
          {role !== "administrative" ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
              <p className="text-red-600 font-medium">You are not allowed to access this page.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Department Name</label>
                <select
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-gray-50/50 transition-all duration-300 cursor-pointer"
                >
                  <option value="">Select Department</option>
                  <option value="informatique">Informatique</option>
                  <option value="genie civil">Génie Civil</option>
                  <option value="electrique">Électrique</option>
                  <option value="mecanique">Mécanique</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-gray-50/50 transition-all duration-300 h-28 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Picture</label>
                <div className="flex items-center space-x-3">
                  <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm cursor-pointer text-sm font-medium hover:shadow-md transition-shadow duration-200">
                    <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                    <span>Choose image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setProfilePicture(e.target.files[0]);
                        } else {
                          setProfilePicture(null);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  <div className="text-sm text-gray-500">
                    {profilePicture ? profilePicture.name : 'No file selected'}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-2xl font-semibold transition-transform duration-200 transform hover:scale-[1.01] shadow-lg"
              >
                Add Department
              </button>
            </form>
          )}

          {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
        </div>
      </div>
    </div>
    </>
  );
}
