'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Adminstrativenavbar from "../components/adminstrativenavbar";

interface User {
    user_id: number;
    first_name: string;
    last_name: string;
    country: string;
    email: string;
    phone_number: string;
    age: number;
    subject: string;
    profile_picture: string;
    joined_at: string;
    bio: string;
    verifed: string;
    role: string;
}

export default function UsersList() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [verifying, setVerifying] = useState<number | null>(null); 
    const [roleuser, setRole] = useState<string | null>(null);
    const [message, setMessage] = useState<{
    type: 'success' | 'error' | null;
    text: string;
  }>({ type: null, text: '' });
   
    const router=useRouter()
    useEffect(() => {
        const token = localStorage.getItem("token");
       
        if(!token){
            router.push("/UserLogin")
        }else{
            setRole(localStorage.getItem("role"))
            fetchUsers()
        }
    }, []);
    

    const fetchUsers = async () => {
        const token = localStorage.getItem("token");
        const role=localStorage.getItem("role")
        console.log(role)
        if (!token) return setError("No token found. Please login.");
        try {
            const res = await fetch("https://university-manager-scholaria-6.onrender.com/fetch_all_users", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch users");
            const data: User[] = await res.json();
            setUsers(data);
            setFilteredUsers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

   
    // Filter functionality
    const applyFilters = (searchTerm: string = '', roleFilter: string = 'all') => {
        let filtered = users;

        // Apply role filter
        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => 
                user.role?.toLowerCase() === roleFilter.toLowerCase()
            );
        }

        // Apply search filter
        if (searchTerm.trim()) {
            filtered = filtered.filter(user => 
                user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.role?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredUsers(filtered);
    };

    // Search functionality
    const handleSearch = (term: string) => {
        setSearchTerm(term);
        applyFilters(term, selectedRole);
    };

    // Role filter functionality
    const handleRoleFilter = (role: string) => {
        setSelectedRole(role);
        applyFilters(searchTerm, role);
    };

    // Get unique roles from users
    const getUniqueRoles = () => {
        const roles = users.map(user => user.role).filter(Boolean);
        return [...new Set(roles)];
    };

    // CSV Export functionality
    const exportToCSV = () => {
        const headers = [
            'User ID',
            'First Name',
            'Last Name',
            'Email',
            'Phone Number',
            'Age',
            'Country',
            'Subject',
            'Role',
            'Verified',
            'Joined At',
            'Bio'
        ];

        const csvData = filteredUsers.map(user => [
            user.user_id,
            user.first_name || '',
            user.last_name || '',
            user.email || '',
            user.phone_number || '',
            user.age || '',
            user.country || '',
            user.subject || '',
            user.role || '',
            user.verifed === "true" ? 'Yes' : 'No',
            new Date(user.joined_at).toLocaleDateString(),
            user.bio || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => 
                row.map(field => 
                    typeof field === 'string' && field.includes(',') 
                        ? `"${field.replace(/"/g, '""')}"` 
                        : field
                ).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-700 text-lg font-medium">Loading users...</p>
            </div>
        </div>
    );
    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-4">
                <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-red-800 font-semibold">Error</h3>
                </div>
                <p className="text-red-700 mt-2">{error}</p>
            </div>
        </div>
    );

    return (
        <>
         {roleuser==="administrative" && <Adminstrativenavbar/>}
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={exportToCSV}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                            >
                                Export in CSV
                            </button>
                            <div className="relative">
                                <select
                                    value={selectedRole}
                                    onChange={(e) => handleRoleFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm font-medium transition-colors duration-200"
                                >
                                    <option value="all">All Roles</option>
                                    {getUniqueRoles().map(role => (
                                        <option key={role} value={role}>
                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search for a member"
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64 transition-colors duration-200"
                                />
                                <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-4">
                        Show {filteredUsers.length} rows • Copy • CSV
                        {(searchTerm || selectedRole !== 'all') && (
                            <span className="ml-2 text-blue-600">
                                (filtered from {users.length} total users
                                {selectedRole !== 'all' && ` • Role: ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
                                {searchTerm && ` • Search: "${searchTerm}"`})
                            </span>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Username
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Full name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email verified
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last activity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last profile update
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user, index) => (
                                    <tr key={user.user_id} className={`${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img
                                                    className="h-10 w-10 rounded-full object-cover"
                                                    src={user.profile_picture}
                                                    alt={`${user.first_name} ${user.last_name}`}
                                                />
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.first_name?.toLowerCase() || 'user'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {user.role}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.first_name} {user.last_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                user.verifed === "true" 
                                                    ? "bg-green-100 text-green-800" 
                                                    : "bg-red-100 text-red-800"
                                            }`}>
                                                {user.verifed === "true" ? "true" : "false"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(user.joined_at).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(user.joined_at).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {user.verifed !== "true" ? (
                                                <button
                                                    disabled={verifying === user.user_id}
                                                    className={`${
                                                        verifying === user.user_id
                                                            ? "bg-gray-400 cursor-not-allowed"
                                                            : "bg-blue-600 hover:bg-blue-700"
                                                    } text-white px-3 py-1 rounded text-sm transition-colors duration-200`}
                                                >
                                                    {verifying === user.user_id ? "Verifying..." : "Verify"}
                                                </button>
                                            ) : (
                                                <span className="text-green-600 font-medium">Verified</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Empty State */}
                    {filteredUsers.length === 0 && users.length > 0 && (
                        <div className="text-center py-16">
                            <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <h3 className="text-2xl font-semibold text-gray-400 mb-2">No Users Found</h3>
                            <p className="text-gray-500">
                                No users match your current filters
                                {selectedRole !== 'all' && ` (Role: ${selectedRole})`}
                                {searchTerm && ` (Search: "${searchTerm}")`}
                            </p>
                            <div className="mt-4 space-x-2">
                                {searchTerm && (
                                    <button 
                                        onClick={() => handleSearch('')}
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Clear search
                                    </button>
                                )}
                                {searchTerm && selectedRole !== 'all' && <span className="text-gray-400">•</span>}
                                {selectedRole !== 'all' && (
                                    <button 
                                        onClick={() => handleRoleFilter('all')}
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Clear role filter
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    {users.length === 0 && (
                        <div className="text-center py-16">
                            <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="text-2xl font-semibold text-gray-400 mb-2">No Users Found</h3>
                            <p className="text-gray-500">Users will appear here once they register.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </>
    );
}
