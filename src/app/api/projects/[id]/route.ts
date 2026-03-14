import { getAuthUser } from '@/lib/auth'
import { respondToInvitation } from '@/lib/services/invitation.service'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: invitationId } = await params
    const body = await req.json()
    const { status } = body

    if (status !== 'ACCEPTED' && status !== 'DECLINED') {
        return NextResponse.json(
            { error: 'Status must be ACCEPTED or DECLINED' },
            { status: 400 }
        )
    }

    try {
        const invitation = await respondToInvitation(
            invitationId,
            user.id,
            user.email,
            status
        )
        return NextResponse.json({ invitation })
    } catch (e: unknown) {
        if (e instanceof Error) {
            if (e.message === 'FORBIDDEN') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            }
            if (e.message === 'NOT_FOUND') {
                return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
            }
            if (e.message === 'ALREADY_RESPONDED') {
                return NextResponse.json({ error: 'Already responded to this invitation' }, { status: 409 })
            }
        }
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}