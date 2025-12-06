'use client'

import { useEffect, useState } from 'react'
import Studentnavbar from '../components/studentnavbar'
interface Professor {
  user_id: number
  first_name: string
  last_name: string
  email: string
  role: string
  profile_picture: string
}

interface Message {
  id: number
  text: string
  sender: 'student' | 'professor'
  timestamp: Date
}

interface BackendMessage {
  id: number
  sender_id: number
  receiver_id: number
  content: string
  sent_at: string
}

export default function MessageProfessor() {
  const [professors, setProfessors] = useState<Professor[]>([])
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null)
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
    const fetchProfessors = async () => {
      try {
        const token = localStorage.getItem('token')
        
        if (token) {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]))
          setCurrentUserId(tokenPayload.sub)
        }
        
        const response = await fetch(`https://university-manager-scholaria-6.onrender.com/fetch_professor_for_students`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch professors')
        }

        const data = await response.json()
        setProfessors(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProfessors()
  }, [])

  const fetchMessagesForConversation = async () => {
    if (!selectedProfessor || !currentUserId) {
      console.log('Cannot fetch: selectedProfessor or currentUserId missing', { selectedProfessor, currentUserId })
      return
    }
    
    try {
      setMessagesLoading(true)
      const token = localStorage.getItem('token')
      console.log('Fetching messages for professor:', selectedStudent.user_id, 'current user:', currentUserId)
      
      const response = await fetch('https://university-manager-scholaria-6.onrender.com/fetch_messages', {
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
      console.log('Selected professor ID type:', typeof selectedProfessor.user_id, 'value:', selectedProfessor.user_id)
      
      // Filter messages for the selected professor conversation
      // Convert IDs to numbers to ensure proper comparison
      const currentUserIdNum = Number(currentUserId)
      const professorIdNum = Number(selectedProfessor.user_id)
      
      const conversationMessages = data.messages.filter((msg: BackendMessage) => {
        const msgSenderId = Number(msg.sender_id)
        const msgReceiverId = Number(msg.receiver_id)
        
        const isMatch = (msgSenderId === currentUserIdNum && msgReceiverId === professorIdNum) ||
                       (msgSenderId === professorIdNum && msgReceiverId === currentUserIdNum)
        
        console.log(`Message ${msg.id}: sender=${msgSenderId}, receiver=${msgReceiverId}, matches=${isMatch}`)
        return isMatch
      })

      console.log('Filtered conversation messages:', conversationMessages)

      // Transform to display format
      const displayMessages: Message[] = conversationMessages.map((msg: BackendMessage) => {
        const msgSenderId = Number(msg.sender_id)
        const sender = msgSenderId === currentUserIdNum ? 'student' : 'professor'
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
    if (selectedProfessor && currentUserId) {
      fetchMessagesForConversation()
      
      // Poll for new messages every 3 seconds
      const interval = setInterval(fetchMessagesForConversation, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedProfessor, currentUserId])

  const handleSelectProfessor = (professor: Professor) => {
    setSelectedProfessor(professor)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedProfessor) return
    
    try {
      const token = localStorage.getItem('token')
      
      // Get current user ID from token
      const tokenPayload = JSON.parse(atob(token!.split('.')[1]))
      const senderId = tokenPayload.sub
      
      const response = await fetch('https://university-manager-scholaria-6.onrender.com/send_message_users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sender_id: senderId,
          receiver_id: selectedProfessor.user_id,
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
      
      const response = await fetch(`https://university-manager-scholaria-6.onrender.com/delete_message/${messageId}`, {
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
      
      const response = await fetch(`https://university-manager-scholaria-6.onrender.com/edit_message/${messageId}`, {
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
    return <div className="p-4">Loading professors...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>
  }

  const filteredProfessors = professors.filter((professor) => {
    const fullName = `${professor.first_name} ${professor.last_name}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase())
  })

  return (
    <>
    <Studentnavbar/>
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Professors List - Left Sidebar */}
      <div className="w-80 bg-white shadow-xl flex flex-col">
        <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Messages</h1>
        </div>
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search professors..."
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
          {filteredProfessors.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No professors found
            </div>
          ) : (
            filteredProfessors.map((professor) => (
            <div
              key={professor.user_id}
              onClick={() => handleSelectProfessor(professor)}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedProfessor?.user_id === professor.user_id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {professor.profile_picture ? (
                  <img
                    src={professor.profile_picture}
                    alt={`${professor.first_name} ${professor.last_name}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {professor.first_name ? professor.first_name.charAt(0).toUpperCase() : 'P'}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{professor.first_name && professor.last_name ? `${professor.first_name} ${professor.last_name}` : 'Unknown'}</h3>
                  <p className="text-xs text-gray-600 capitalize">{professor.role || ''}</p>
                  <p className="text-sm text-gray-500 truncate">{professor.email || ''}</p>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area - Right Side */}
      <div className="flex-1 flex flex-col">
        {selectedProfessor ? (
          <>
            {/* Chat Header */}
            <div className="bg-white p-4 border-b border-gray-300 flex items-center gap-3">
              {selectedProfessor.profile_picture ? (
                <img
                  src={selectedProfessor.profile_picture}
                  alt={`${selectedProfessor.first_name} ${selectedProfessor.last_name}`}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {selectedProfessor.first_name ? selectedProfessor.first_name.charAt(0).toUpperCase() : 'P'}
                </div>
              )}
              <div>
                <h2 className="font-semibold text-gray-900">{selectedProfessor.first_name && selectedProfessor.last_name ? `${selectedProfessor.first_name} ${selectedProfessor.last_name}` : 'Unknown'}</h2>
                <p className="text-xs text-gray-600 capitalize">{selectedProfessor.role || ''}</p>
                <p className="text-sm text-gray-500">{selectedProfessor.email || ''}</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messagesLoading && messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'student' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className={`flex items-start gap-2 ${
                      message.sender === 'student' ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                      <div
                        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                          message.sender === 'student'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-900'
                        }`}
                      >
                        {editingMessageId === message.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              className="w-full px-2 py-1 text-gray-900 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveEdit(message.id)}
                                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p>{message.text}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.sender === 'student' ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              {new Date(message.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </>
                        )}
                      </div>
                      {message.sender === 'student' && editingMessageId !== message.id && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditMessage(message.id, message.text)}
                            className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Edit message"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Delete message"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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
            <div className="bg-white p-4 border-t border-gray-300">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={!newMessage.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="mt-4 text-lg">Select a professor to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}