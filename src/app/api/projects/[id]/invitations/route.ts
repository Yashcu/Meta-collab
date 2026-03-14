import { getAuthUser } from '@/lib/auth'
import {
    sendInvitation,
    getProjectInvitations,
} from '@/lib/services/invitation.service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: projectId } = await params

    try {
        const invitations = await getProjectInvitations(projectId, user.id)
        return NextResponse.json({ invitations })
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
    const { email } = body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
        return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    try {
        const invitation = await sendInvitation(projectId, user.id, email)
        return NextResponse.json({ invitation }, { status: 201 })
    } catch (e: unknown) {
        if (e instanceof Error) {
            if (e.message === 'FORBIDDEN') {
                return NextResponse.json({ error: 'Only admins can invite members' }, { status: 403 })
            }
            if (e.message === 'ALREADY_MEMBER') {
                return NextResponse.json({ error: 'This person is already a member' }, { status: 409 })
            }
            if (e.message === 'ALREADY_INVITED') {
                return NextResponse.json({ error: 'This person already has a pending invitation' }, { status: 409 })
            }
        }
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}