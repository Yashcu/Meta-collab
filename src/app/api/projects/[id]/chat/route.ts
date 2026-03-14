import { getAuthUser } from '@/lib/auth'
import { sendMessage } from '@/lib/services/chat.service'
import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter: max 10 messages per minute per user
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string): boolean {
    const now = Date.now()
    const key = userId
    const entry = rateLimitMap.get(key)

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(key, { count: 1, resetAt: now + 60_000 })
        return true
    }

    if (entry.count >= 10) return false

    entry.count++
    return true
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!checkRateLimit(user.id)) {
        return NextResponse.json(
            { error: 'Too many messages — slow down' },
            { status: 429 }
        )
    }

    const { id: projectId } = await params
    const body = await req.json()
    const { message } = body

    if (!message || typeof message !== 'string') {
        return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    try {
        const chatMessage = await sendMessage(projectId, user.id, message)
        return NextResponse.json({ message: chatMessage }, { status: 201 })
    } catch (e: unknown) {
        if (e instanceof Error) {
            if (e.message === 'FORBIDDEN') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }
            if (e.message === 'EMPTY_MESSAGE') {
                return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
            }
            if (e.message === 'MESSAGE_TOO_LONG') {
                return NextResponse.json(
                    { error: 'Message too long (max 500 chars)' },
                    { status: 400 }
                )
            }
        }
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}