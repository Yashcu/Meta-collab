'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/lib/hooks/useChat'

type CurrentUser = { id: string; name: string | null; email: string }

function getInitials(user: { name: string | null; email: string }) {
    if (user.name) {
        return user.name
            .split(' ')
            .map((n) => n[0] ?? '')
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }
    return (user.email[0] ?? '?').toUpperCase()
}

export function ChatPanel({
    projectId,
    currentUser,
}: {
    projectId: string
    currentUser: CurrentUser
}) {
    const { messages, activeUsers, sending, sendMessage } = useChat(
        projectId,
        currentUser
    )
    const [input, setInput] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [unread, setUnread] = useState(0)
    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const prevMessageCount = useRef(0)

    // Track unread messages when panel is closed
    useEffect(() => {
        if (!isOpen && messages.length > prevMessageCount.current) {
            setUnread((prev) => prev + (messages.length - prevMessageCount.current))
        }
        prevMessageCount.current = messages.length
    }, [messages.length, isOpen])

    // On open: scroll, focus, clear unread — all deferred to avoid setState-in-effect
    useEffect(() => {
        if (!isOpen) return
        const scrollTimer = setTimeout(
            () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }),
            50
        )
        const focusTimer = setTimeout(() => inputRef.current?.focus(), 100)
        const unreadTimer = setTimeout(() => setUnread(0), 0)
        return () => {
            clearTimeout(scrollTimer)
            clearTimeout(focusTimer)
            clearTimeout(unreadTimer)
        }
    }, [isOpen])

    // Auto scroll on new messages when open
    useEffect(() => {
        if (!isOpen) return
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isOpen])

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

    function formatDateLabel(iso: string) {
        const date = new Date(iso)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.toDateString() === today.toDateString()) return 'Today'
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }

    const groupedMessages = messages.reduce(
        (groups, msg) => {
            const label = formatDateLabel(msg.createdAt)
            if (!groups[label]) groups[label] = []
            groups[label].push(msg)
            return groups
        },
        {} as Record<string, typeof messages>
    )

    return (
        <>
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
                {!isOpen && unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-medium">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    className="fixed right-6 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col z-40"
                    style={{ bottom: '80px', height: '460px' }}
                >
                    <div className="px-4 py-3 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-900">Team chat</h3>
                            {activeUsers.length > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                    <span className="text-xs text-slate-400">
                                        {activeUsers.length} online
                                    </span>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Ephemeral — cleared when all leave
                        </p>
                    </div>

                    {activeUsers.length > 0 && (
                        <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2">
                            <div className="flex -space-x-1">
                                {activeUsers.map((u) => (
                                    <div
                                        key={u.id}
                                        className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-medium flex items-center justify-center border-2 border-white"
                                        title={u.name || u.email}
                                    >
                                        {getInitials(u)}
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {activeUsers.map((u) => (
                                    <span key={u.id} className="text-xs text-slate-400">
                                        {u.name || u.email.split('@')[0]}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto px-4 py-3">
                        {messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-xs text-slate-300 text-center leading-relaxed">
                                    No messages yet.
                                    <br />
                                    Say hello to your team!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(groupedMessages).map(([label, msgs]) => (
                                    <div key={label}>
                                        <div className="flex items-center gap-2 my-2">
                                            <div className="flex-1 h-px bg-slate-100" />
                                            <span className="text-xs text-slate-300 shrink-0">{label}</span>
                                            <div className="flex-1 h-px bg-slate-100" />
                                        </div>
                                        <div className="space-y-3">
                                            {msgs.map((msg) => {
                                                const isOwn = msg.user.id === currentUser.id
                                                return (
                                                    <div
                                                        key={msg.id}
                                                        className={`flex flex-col gap-0.5 ${isOwn ? 'items-end' : 'items-start'}`}
                                                    >
                                                        <span className="text-xs text-slate-400">
                                                            {isOwn
                                                                ? 'You'
                                                                : msg.user.name || msg.user.email.split('@')[0]}
                                                            {' · '}
                                                            {formatTime(msg.createdAt)}
                                                        </span>
                                                        <div
                                                            className={`px-3 py-2 rounded-2xl text-sm max-w-[85%] break-words leading-relaxed ${isOwn
                                                                ? 'bg-blue-600 text-white rounded-br-sm'
                                                                : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                                                                }`}
                                                        >
                                                            {msg.message}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    <div className="px-3 py-3 border-t border-slate-100">
                        <div className="flex items-end gap-2">
                            <textarea
                                ref={inputRef}
                                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
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
                        <p className="text-xs text-slate-300 mt-1 text-right">
                            {input.length}/500
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}