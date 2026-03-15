import { getAuthUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

type MemberWithUser = {
    userId: string
    role: string
    joinedAt: Date
    user: {
        id: string
        name: string | null
        email: string
    }
}

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: projectId } = await params

    const member = await db.projectMember.findFirst({
        where: { projectId, userId: user.id },
    })
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const members = await db.projectMember.findMany({
        where: { projectId },
        include: {
            user: {
                select: { id: true, name: true, email: true },
            },
        },
        orderBy: { joinedAt: 'asc' },
    })

    return NextResponse.json({
        members: members.map((m: MemberWithUser) => ({
            id: m.userId,
            name: m.user.name,
            email: m.user.email,
            role: m.role,
        })),
    })
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: projectId } = await params
    const url = new URL(req.url)
    const targetUserId = url.searchParams.get('userId')

    if (!targetUserId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const requester = await db.projectMember.findFirst({
        where: { projectId, userId: user.id, role: 'ADMIN' },
    })
    if (!requester) {
        return NextResponse.json(
            { error: 'Only admins can remove members' },
            { status: 403 }
        )
    }

    if (targetUserId === user.id) {
        return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 })
    }

    await db.projectMember.delete({
        where: {
            projectId_userId: { projectId, userId: targetUserId },
        },
    })

    return NextResponse.json({ success: true })
}