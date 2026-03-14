import { getAuthUser } from '@/lib/auth'
import {
    pollMessages,
    cleanupEphemeralMessages,
} from '@/lib/services/chat.service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: projectId } = await params
    const { searchParams } = new URL(req.url)
    const since = searchParams.get('since')

    try {
        // Check and clean up ephemeral messages if workspace is empty
        await cleanupEphemeralMessages(projectId)

        const data = await pollMessages(projectId, user.id, since)
        return NextResponse.json(data)
    } catch (e: unknown) {
        if (e instanceof Error && e.message === 'FORBIDDEN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}