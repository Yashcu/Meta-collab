'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type User = { id: string; name: string | null; email: string }

type ChatMessage = {
    id: string
    message: string
    createdAt: string
    user: User
}

export function useChat(projectId: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [activeUsers, setActiveUsers] = useState<User[]>([])
    const [sending, setSending] = useState(false)
    const timestampRef = useRef<string | null>(null)
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)

    const poll = useCallback(async () => {
        try {
            const url = timestampRef.current
                ? `/api/projects/${projectId}/chat/poll?since=${encodeURIComponent(timestampRef.current)}`
                : `/api/projects/${projectId}/chat/poll`

            const res = await fetch(url)
            if (!res.ok) return

            const data = await res.json()

            if (data.messages && data.messages.length > 0) {
                setMessages((prev) => {
                    const existingIds = new Set(prev.map((m) => m.id))
                    const newMessages = data.messages.filter(
                        (m: ChatMessage) => !existingIds.has(m.id)
                    )
                    return [...prev, ...newMessages]
                })
            }

            if (data.activeUsers) {
                setActiveUsers(data.activeUsers)
            }

            if (data.timestamp) {
                timestampRef.current = data.timestamp
            }
        } catch {
            // silent fail
        }
    }, [projectId])

    const sendHeartbeat = useCallback(async () => {
        try {
            await fetch(`/api/projects/${projectId}/chat/heartbeat`, {
                method: 'POST',
            })
        } catch {
            // silent fail
        }
    }, [projectId])

    useEffect(() => {
        // Initial poll + heartbeat
        poll()
        sendHeartbeat()

        // Poll every 2 seconds
        pollIntervalRef.current = setInterval(poll, 2000)

        // Heartbeat every 30 seconds
        heartbeatIntervalRef.current = setInterval(sendHeartbeat, 30000)

        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
            if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current)
        }
    }, [poll, sendHeartbeat])

    async function sendMessage(text: string) {
        if (!text.trim() || sending) return false
        setSending(true)

        // Optimistic update — add message locally immediately
        const optimisticId = `optimistic-${Date.now()}`
        const optimisticMessage: ChatMessage = {
            id: optimisticId,
            message: text.trim(),
            createdAt: new Date().toISOString(),
            user: { id: 'me', name: 'You', email: '' },
        }
        setMessages((prev) => [...prev, optimisticMessage])

        try {
            const res = await fetch(`/api/projects/${projectId}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text.trim() }),
            })

            if (!res.ok) {
                // Remove optimistic message on failure
                setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
                return false
            }

            const data = await res.json()

            // Replace optimistic message with real one
            setMessages((prev) =>
                prev.map((m) => (m.id === optimisticId ? data.message : m))
            )

            return true
        } catch {
            setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
            return false
        } finally {
            setSending(false)
        }
    }

    return { messages, activeUsers, sending, sendMessage }
}