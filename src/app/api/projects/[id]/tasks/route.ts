import { getAuthUser } from '@/lib/auth'
import { getProjectTasks, createTask } from '@/lib/services/task.service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: projectId } = await params

    try {
        const tasks = await getProjectTasks(projectId, user.id)
        return NextResponse.json({ tasks })
    } catch (e: unknown) {
        if (e instanceof Error && e.message === 'FORBIDDEN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: projectId } = await params
    const body = await req.json()
    const { title, description, assignedToUserId } = body

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json({ error: 'Task title is required' }, { status: 400 })
    }

    if (title.trim().length > 100) {
        return NextResponse.json({ error: 'Title must be 100 characters or less' }, { status: 400 })
    }

    try {
        const task = await createTask(projectId, user.id, {
            title,
            description,
            assignedToUserId,
        })
        return NextResponse.json({ task }, { status: 201 })
    } catch (e: unknown) {
        if (e instanceof Error && e.message === 'FORBIDDEN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}