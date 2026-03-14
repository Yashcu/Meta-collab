import { getAuthUser } from '@/lib/auth'
import { updateHeartbeat } from '@/lib/services/chat.service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: projectId } = await params

    try {
        await updateHeartbeat(projectId, user.id)
        return NextResponse.json({ ok: true })
    } catch (e: unknown) {
        if (e instanceof Error && e.message === 'FORBIDDEN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}