import { getAuthUser } from '@/lib/auth'
import {
    createProject,
    getUserProjects,
} from '@/lib/services/project.service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
    const user = await getAuthUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projects = await getUserProjects(user.id)
    return NextResponse.json({ projects })
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