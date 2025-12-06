'use client'

import { useState, useMemo, useEffect } from "react";
import Select from "react-select";
import countryList from "react-select-country-list";

export default function UserRegistration() {
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [phone_number, setPhoneNumber] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [profile_picture, setProfilePicture] = useState<File | null>(null);
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | null;
    text: string;
  }>({ type: null, text: '' });

  const options = useMemo(() => countryList().getData(), []);

  useEffect(() => {
    if (message.type) {
      const timer = setTimeout(() => {
        setMessage({ type: null, text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const data = new FormData();
    data.append("first_name", first_name);
    data.append("last_name", last_name);
    data.append("country", country);
    data.append("email", email);
    data.append("phone_number", phone_number);
    data.append("age", age);
    data.append("password", password);
    if (profile_picture) data.append("profile_picture", profile_picture);
    data.append("bio", bio);
    data.append("role", role);

    try {
      const res = await fetch("https://university-manager-scholaria-6.onrender.com/user_registration", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      
      if (res.ok) {
        setMessage({
          type: 'success',
          text: result.msg || 'Account created successfully! Welcome to Scholaria!'
        });
        setFirstName("");
        setLastName("");
        setCountry("");
        setEmail("");
        setPhoneNumber("");
        setAge("");
        setPassword("");
        setProfilePicture(null);
        setBio("");
        setRole("");
      } else {
        setMessage({
          type: 'error',
          text: result.msg || 'Registration failed. Please try again.'
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({
        type: 'error',
        text: 'Failed to register user. Please check your connection and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
  <div className="absolute -top-44 -right-44 w-80 h-80 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-8"></div>
  <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-400 via-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-8"></div>
  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-indigo-400 via-green-400 to-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-8"></div>
        
        {/* Additional floating elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full opacity-20"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-r from-pink-300 to-yellow-300 rounded-full opacity-20"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-r from-green-300 to-blue-300 rounded-full opacity-20"></div>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 via-blue-600 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur opacity-50 animate-pulse group-hover:opacity-75 transition-opacity"></div>
            <svg className="w-12 h-12 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-3">
            Create Your Account
          </h2>
          <p className="text-gray-600 text-lg font-medium">Join Scholaria and start your educational journey</p>
          <div className="w-32 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 mx-auto rounded-full mt-4"></div>
        </div>

  <div className="bg-white p-8 shadow-md rounded-xl border border-gray-100 relative overflow-hidden">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-blue-50/10 pointer-events-none"></div>
          <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full"></div>
          <div className="absolute top-1/2 left-4 w-10 h-10 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full"></div>
          {/* Enhanced Message Display */}
          {message.type && (
            <div className={`p-6 rounded-2xl border-l-4 mb-8 relative overflow-hidden backdrop-blur-sm transition-all duration-500 transform ${
              message.type === 'success' 
                ? 'bg-green-50/90 border-green-400 text-green-700 shadow-lg shadow-green-100/50'
                : 'bg-red-50/90 border-red-400 text-red-700 shadow-lg shadow-red-100/50'
            }`}>
              {/* Decorative gradient overlay */}
              <div className={`absolute inset-0 opacity-10 ${
                message.type === 'success' 
                  ? 'bg-gradient-to-r from-green-400 to-teal-400' 
                  : 'bg-gradient-to-r from-red-400 to-pink-400'
              }`}></div>
              
              <div className="flex items-center relative z-10">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-full ${
                    message.type === 'success'
                      ? 'bg-green-100 text-green-500 shadow-lg shadow-green-200/50' 
                      : 'bg-red-100 text-red-500 shadow-lg shadow-red-200/50'
                  }`}>
                    {message.type === 'success' ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-bold text-lg mb-1">
                    {message.type === 'success' ? 'Registration Successful!' : 'Registration Failed'}
                  </h4>
                  <p className="text-sm font-medium opacity-90">{message.text}</p>
                </div>
                <button
                  onClick={() => setMessage({ type: null, text: '' })}
                  className="ml-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">

            {/* Name Fields Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group relative">
                <label htmlFor="first_name" className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="first_name"
                    type="text"
                    value={first_name}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 bg-white transition-all duration-200 placeholder-gray-500 text-gray-800 font-medium"
                    placeholder="Enter your first name"
                  />
                </div>
              </div>

              <div className="group relative">
                <label htmlFor="last_name" className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="last_name"
                    type="text"
                    value={last_name}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 bg-white transition-all duration-200 placeholder-gray-500 text-gray-800 font-medium"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
            </div>

            {/* Country and Age Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group relative">
                <label htmlFor="country" className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  Country
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <Select
                    options={options}
                    value={options.find(opt => opt.value === country)}
                    onChange={(selected) => setCountry(selected?.value || "")}
                    className="text-sm"
                    placeholder="Select your country"
                    classNames={{
                      control: (state) =>
                        "!pl-8 !py-2 !border-2 !border-gray-200 !rounded-2xl !shadow-sm focus:!ring-4 focus:!ring-blue-200 hover:!border-gray-300 !bg-gray-50/50 backdrop-blur-sm transition-all duration-300",
                    }}
                  />
                </div>
              </div>

              <div className="group relative">
                <label htmlFor="age" className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  Age
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M4 7v13a1 1 0 001 1h14a1 1 0 001-1V7H4zM8 11h8" />
                    </svg>
                  </div>
                  <input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    min="16"
                    max="100"
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 bg-white transition-all duration-200 placeholder-gray-500 text-gray-800 font-medium"
                    placeholder="Enter your age"
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="group relative">
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 bg-white transition-all duration-200 placeholder-gray-500 text-gray-800 font-medium"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Phone Number Field */}
            <div className="group relative">
              <label htmlFor="phone_number" className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  id="phone_number"
                  type="tel"
                  value={phone_number}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 bg-white transition-all duration-200 placeholder-gray-500 text-gray-800 font-medium"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="group relative">
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300 placeholder-gray-500 text-gray-800 font-medium group-hover:border-gray-300 focus:bg-white hover:shadow-lg focus:shadow-xl"
                  placeholder="Create a strong password"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="group relative">
              <label htmlFor="role" className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className="w-full pl-11 pr-10 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300 text-gray-800 font-medium group-hover:border-gray-300 focus:bg-white hover:shadow-lg focus:shadow-xl appearance-none"
                >
                  <option value="" className="text-gray-500">Select your role</option>
                  <option value="professor">Professor</option>
                  <option value="student">Student</option>
                  <option value="administrative">Administrative</option>
                  <option value="director">Director</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Profile Picture Upload */}
            <div className="group relative">
              <label htmlFor="profile_picture" className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                Profile Picture
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  id="profile_picture"
                  type="file"
                  onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
                  accept="image/*"
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 bg-white transition-all duration-200 text-gray-800 font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:transition-colors file:duration-200"
                />
              </div>
            </div>

            {/* Bio Field */}
            <div className="group relative">
              <label htmlFor="bio" className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                Bio
              </label>
              <div className="relative">
                <div className="absolute top-4 left-0 pl-3 flex items-start pointer-events-none z-10">
                  <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 group-hover:text-blue-400 transition-colors duration-300 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  required
                  rows={5}
                  className="w-full pl-11 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300 placeholder-gray-500 text-gray-800 font-medium group-hover:border-gray-300 focus:bg-white hover:shadow-lg focus:shadow-xl resize-none"
                  placeholder="Tell us about yourself, your interests, and goals..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="group w-full bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-green-700 hover:via-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Your Account...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Create Your Account
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Enhanced Footer */}
            <div className="text-center pt-6 border-t border-gray-200/50 relative z-10">
              <p className="text-gray-600 text-base">
                Already have an account?{" "}
                <a href="/UserLogin" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all duration-200 relative group">
                  <span className="relative z-10">Sign in here</span>
                  <div className="absolute inset-0 bg-blue-100 rounded-lg opacity-0 group-hover:opacity-50 transition-opacity duration-200 -m-1"></div>
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
