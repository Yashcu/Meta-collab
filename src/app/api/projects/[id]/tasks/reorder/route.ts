import { getAuthUser } from '@/lib/auth'
import { reorderTasks } from '@/lib/services/task.service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: projectId } = await params
    const body = await req.json()
    const { updates } = body

    if (!Array.isArray(updates) || updates.length === 0) {
        return NextResponse.json({ error: 'Updates array is required' }, { status: 400 })
    }

    try {
        const tasks = await reorderTasks(projectId, user.id, updates)
        return NextResponse.json({ tasks })
    } catch (e: unknown) {
        if (e instanceof Error && e.message === 'FORBIDDEN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}