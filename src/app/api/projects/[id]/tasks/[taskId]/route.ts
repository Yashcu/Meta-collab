import { getAuthUser } from '@/lib/auth'
import { updateTask, deleteTask } from '@/lib/services/task.service'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; taskId: string }> }
) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: projectId, taskId } = await params
    const body = await req.json()

    try {
        const task = await updateTask(projectId, taskId, user.id, body)
        return NextResponse.json({ task })
    } catch (e: unknown) {
        if (e instanceof Error) {
            if (e.message === 'FORBIDDEN') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }
            if (e.message === 'NOT_FOUND') {
                return NextResponse.json({ error: 'Task not found' }, { status: 404 })
            }
        }
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string; taskId: string }> }
) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: projectId, taskId } = await params

    try {
        await deleteTask(projectId, taskId, user.id)
        return NextResponse.json({ success: true })
    } catch (e: unknown) {
        if (e instanceof Error) {
            if (e.message === 'FORBIDDEN') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }
            if (e.message === 'NOT_FOUND') {
                return NextResponse.json({ error: 'Task not found' }, { status: 404 })
            }
        }
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}