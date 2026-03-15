import { getAuthUser } from '@/lib/auth'
import { getProjectById, deleteProject } from '@/lib/services/project.service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const project = await getProjectById(id, user.id)

    if (!project) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ project })
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    try {
        await deleteProject(id, user.id)
        return NextResponse.json({ success: true })
    } catch (e: unknown) {
        if (e instanceof Error && e.message === 'FORBIDDEN') {
            return NextResponse.json(
                { error: 'Only admins can delete projects' },
                { status: 403 }
            )
        }
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}