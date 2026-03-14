import { getAuthUser } from '@/lib/auth'
import { getPendingInvitations } from '@/lib/services/invitation.service'
import { NextResponse } from 'next/server'

export async function GET() {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const invitations = await getPendingInvitations(user.email)
    return NextResponse.json({ invitations })
}