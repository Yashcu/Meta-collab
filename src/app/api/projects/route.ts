import { getAuthUser } from '@/lib/auth'
import {
    createProject,
    getProjectById,
    deleteProject,
} from '@/lib/services/project.service'
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

export async function POST(req: NextRequest) {
    const user = await getAuthUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
    }

    if (name.trim().length > 50) {
        return NextResponse.json({ error: 'Name must be 50 characters or less' }, { status: 400 })
    }

    const project = await createProject(user.id, {
        name: name.trim(),
        description: description?.trim() || undefined,
    })

    return NextResponse.json({ project }, { status: 201 })
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
            return NextResponse.json({ error: 'Only admins can delete projects' }, { status: 403 })
        }
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}