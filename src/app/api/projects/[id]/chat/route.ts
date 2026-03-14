import { getAuthUser } from '@/lib/auth'
import { sendMessage } from '@/lib/services/chat.service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
                return NextResponse.json({ error: 'Message too long (max 500 chars)' }, { status: 400 })
            }
        }
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}