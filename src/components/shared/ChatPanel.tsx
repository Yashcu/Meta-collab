'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/lib/hooks/useChat'

function getInitials(user: { name: string | null; email: string }) {
    if (user.name) {
        return user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }
    return user.email[0].toUpperCase()
}

export function ChatPanel({
    projectId,
    currentUserId,
}: {
    projectId: string
    currentUserId: string
}) {
    const { messages, activeUsers, sending, sendMessage } = useChat(projectId)
    const [input, setInput] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    // Auto scroll to bottom on new messages
    useEffect(() => {
        if (isOpen) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, isOpen])

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen])

    async function handleSend() {
        if (!input.trim() || sending) return
        const text = input
        setInput('')
        await sendMessage(text)
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    function formatTime(iso: string) {
        return new Date(iso).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <>
            {/* Toggle button */}
            <button
                onClick={() => setIsOpen((v) => !v)}
                className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-40"
                title="Toggle chat"
            >
                {isOpen ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                )}
                {!isOpen && messages.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                        {messages.length > 9 ? '9+' : messages.length}
                    </span>
                )}
            </button>

            {/* Chat panel */}
            {isOpen && (
                <div className="fixed bottom-22 right-6 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col z-40"
                    style={{ height: '460px', bottom: '80px' }}
                >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Team chat</h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Messages are ephemeral — cleared when all leave
                            </p>
                        </div>
                    </div>

                    {/* Active users */}
                    {activeUsers.length > 0 && (
                        <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-1.5">
                            <span className="text-xs text-slate-400">Online:</span>
                            <div className="flex -space-x-1">
                                {activeUsers.map((u) => (
                                    <div
                                        key={u.id}
                                        className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs font-medium flex items-center justify-center border border-white"
                                        title={u.name || u.email}
                                    >
                                        {getInitials(u)}
                                    </div>
                                ))}
                            </div>
                            <span className="text-xs text-slate-400">
                                {activeUsers.length} online
                            </span>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                        {messages.length === 0 && (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-xs text-slate-300 text-center">
                                    No messages yet.
                                    <br />
                                    Say hello to your team!
                                </p>
                            </div>
                        )}
                        {messages.map((msg) => {
                            const isOwn = msg.user.id === currentUserId || msg.user.id === 'me'
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col gap-0.5 ${isOwn ? 'items-end' : 'items-start'}`}
                                >
                                    <span className="text-xs text-slate-400">
                                        {isOwn ? 'You' : msg.user.name || msg.user.email}
                                        {' · '}
                                        {formatTime(msg.createdAt)}
                                    </span>
                                    <div
                                        className={`px-3 py-2 rounded-2xl text-sm max-w-[85%] break-words ${isOwn
                                                ? 'bg-blue-600 text-white rounded-br-sm'
                                                : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                                            }`}
                                    >
                                        {msg.message}
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="px-3 py-3 border-t border-slate-100">
                        <div className="flex items-end gap-2">
                            <textarea
                                ref={inputRef}
                                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Message... (Enter to send)"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={1}
                                maxLength={500}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || sending}
                                className="w-8 h-8 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center justify-center shrink-0"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13" />
                                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}