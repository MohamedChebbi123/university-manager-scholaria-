'use client'

import { useEffect, useState } from 'react'
import ProfessorNavbar from '../components/professornavbar'
interface Student {
  user_id: number
  first_name: string
  last_name: string
  email: string
  profile_picture: string
  role: string
}

interface Message {
  id: number
  text: string
  sender: 'professor' | 'student'
  timestamp: Date
}

interface BackendMessage {
  id: number
  sender_id: number
  receiver_id: number
  content: string
  sent_at: string
}

export default function MessageStudent() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null)
  const [editedContent, setEditedContent] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token')
        
        // Get current user ID from token
        if (token) {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]))
          setCurrentUserId(tokenPayload.sub)
        }
        
        const response = await fetch(`http://127.0.0.1:8000/fetch_students_for_professor`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch students')
        }

        const data = await response.json()
        setStudents(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  const fetchMessagesForConversation = async () => {
    if (!selectedStudent || !currentUserId) {
      console.log('Cannot fetch: selectedStudent or currentUserId missing', { selectedStudent, currentUserId })
      return
    }
    
    try {
      setMessagesLoading(true)
      const token = localStorage.getItem('token')
      console.log('Fetching messages for student:', selectedStudent.user_id, 'current user:', currentUserId)
      
      const response = await fetch('http://127.0.0.1:8000/fetch_messages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response not ok:', response.status, errorText)
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()
      console.log('All messages from API:', data)
      console.log('Current user ID type:', typeof currentUserId, 'value:', currentUserId)
      console.log('Selected student ID type:', typeof selectedStudent.user_id, 'value:', selectedStudent.user_id)
      
      // Filter messages for the selected student conversation
      // Convert IDs to numbers to ensure proper comparison
      const currentUserIdNum = Number(currentUserId)
      const studentIdNum = Number(selectedStudent.user_id)
      
      const conversationMessages = data.messages.filter((msg: BackendMessage) => {
        const msgSenderId = Number(msg.sender_id)
        const msgReceiverId = Number(msg.receiver_id)
        
        const isMatch = (msgSenderId === currentUserIdNum && msgReceiverId === studentIdNum) ||
                       (msgSenderId === studentIdNum && msgReceiverId === currentUserIdNum)
        
        console.log(`Message ${msg.id}: sender=${msgSenderId}, receiver=${msgReceiverId}, matches=${isMatch}`)
        return isMatch
      })

      console.log('Filtered conversation messages:', conversationMessages)

      // Transform to display format
      const displayMessages: Message[] = conversationMessages.map((msg: BackendMessage) => {
        const msgSenderId = Number(msg.sender_id)
        const sender = msgSenderId === currentUserIdNum ? 'professor' : 'student'
        console.log(`Message ${msg.id}: sender_id=${msgSenderId}, currentUser=${currentUserIdNum}, determined sender=${sender}`)
        
        return {
          id: msg.id,
          text: msg.content,
          sender: sender,
          timestamp: new Date(msg.sent_at)
        }
      })

      console.log('Display messages:', displayMessages)
      setMessages(displayMessages)
    } catch (err) {
      console.error('Error fetching messages:', err)
      alert('Error loading messages. Check console for details.')
    } finally {
      setMessagesLoading(false)
    }
  }

  useEffect(() => {
    if (selectedStudent && currentUserId) {
      fetchMessagesForConversation()
      
      // Poll for new messages every 3 seconds
      const interval = setInterval(fetchMessagesForConversation, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedStudent, currentUserId])

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedStudent) return
    
    try {
      const token = localStorage.getItem('token')
      
      // Get current user ID from token
      const tokenPayload = JSON.parse(atob(token!.split('.')[1]))
      const senderId = tokenPayload.sub
      
      const response = await fetch('http://127.0.0.1:8000/send_message_users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sender_id: senderId,
          receiver_id: selectedStudent.user_id,
          content: newMessage
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setNewMessage('')
      // Fetch messages immediately after sending to update the conversation
      await fetchMessagesForConversation()
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Failed to send message')
    }
  }

  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`http://127.0.0.1:8000/delete_message/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete message')
      }

      // Fetch messages immediately after deleting to update the conversation
      await fetchMessagesForConversation()
    } catch (err) {
      console.error('Error deleting message:', err)
      alert('Failed to delete message')
    }
  }

  const handleEditMessage = (messageId: number, currentText: string) => {
    setEditingMessageId(messageId)
    setEditedContent(currentText)
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditedContent('')
  }

  const handleSaveEdit = async (messageId: number) => {
    if (!editedContent.trim()) return

    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`http://127.0.0.1:8000/edit_message/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: editedContent
        })
      })

      if (!response.ok) {
        throw new Error('Failed to edit message')
      }

      setEditingMessageId(null)
      setEditedContent('')
      // Fetch messages immediately after editing to update the conversation
      await fetchMessagesForConversation()
    } catch (err) {
      console.error('Error editing message:', err)
      alert('Failed to edit message')
    }
  }

  if (loading) {
    return <div className="p-4">Loading students...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>
  }

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase())
  })

  return (
    <>
    <ProfessorNavbar/>
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Students List - Left Sidebar */}
      <div className="w-80 bg-white shadow-xl flex flex-col">
        <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Messages
          </h1>
        </div>
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredStudents.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No students found
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div
                key={student.user_id}
                onClick={() => handleSelectStudent(student)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:shadow-md ${
                  selectedStudent?.user_id === student.user_id ? 'bg-blue-50 border-l-4 border-l-blue-500 shadow-md' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {student.profile_picture ? (
                    <img
                      src={student.profile_picture}
                      alt={`${student.first_name} ${student.last_name}`}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {student.first_name ? student.first_name.charAt(0).toUpperCase() : 'S'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{student.first_name && student.last_name ? `${student.first_name} ${student.last_name}` : 'Unknown'}</h3>
                    <p className="text-xs text-gray-600 capitalize">{student.role || ''}</p>
                    <p className="text-sm text-gray-500 truncate">{student.email || ''}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area - Right Side */}
      <div className="flex-1 flex flex-col">
        {selectedStudent ? (
          <>
            {/* Chat Header */}
            <div className="bg-white shadow-lg p-5 flex items-center gap-4 border-b border-gray-200">
              {selectedStudent.profile_picture ? (
                <img
                  src={selectedStudent.profile_picture}
                  alt={`${selectedStudent.first_name} ${selectedStudent.last_name}`}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-300 shadow-md"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold shadow-md">
                  {selectedStudent.first_name ? selectedStudent.first_name.charAt(0).toUpperCase() : 'S'}
                </div>
              )}
              <div>
                <h2 className="font-bold text-gray-900 text-lg">{selectedStudent.first_name && selectedStudent.last_name ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Unknown'}</h2>
                <p className="text-xs text-gray-600 capitalize">{selectedStudent.role || ''}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  {selectedStudent.email || ''}
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
              {messagesLoading && messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-10 flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                  <p className="font-medium">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-10 flex flex-col items-center gap-3">
                  <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="font-medium text-lg">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex animate-fadeIn group ${
                      message.sender === 'professor' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className={`flex items-start gap-2 ${
                      message.sender === 'professor' ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                      <div
                        className={`max-w-xs md:max-w-md lg:max-w-lg px-5 py-3 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg ${
                          message.sender === 'professor'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                        }`}
                      >
                        {editingMessageId === message.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              className="w-full px-4 py-2 text-gray-900 bg-gray-50 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveEdit(message.id)}
                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all duration-200"
                              >
                                ✓ Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-4 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-sm font-medium rounded-lg hover:from-gray-500 hover:to-gray-600 shadow-md hover:shadow-lg transition-all duration-200"
                              >
                                ✕ Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="leading-relaxed">{message.text}</p>
                            <p
                              className={`text-xs mt-2 flex items-center gap-1 ${
                                message.sender === 'professor' ? 'text-blue-100' : 'text-gray-400'
                              }`}
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              {new Date(message.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </>
                        )}
                      </div>
                      {message.sender === 'professor' && editingMessageId !== message.id && (
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditMessage(message.id, message.text)}
                            className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-all shadow-sm hover:shadow"
                            title="Edit message"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all shadow-sm hover:shadow"
                            title="Delete message"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white shadow-2xl p-6 border-t border-gray-200">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-full focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900 placeholder-gray-400"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                  disabled={!newMessage.trim()}
                >
                  <span>Send</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="text-center p-8 animate-fadeIn">
              <div className="relative">
                <svg
                  className="mx-auto h-24 w-24 text-gray-300 animate-bounce"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full animate-ping"></div>
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900">No student selected</h3>
              <p className="mt-2 text-base text-gray-500">
                Choose a student from the sidebar to begin your conversation
              </p>
              <div className="mt-6 flex justify-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
