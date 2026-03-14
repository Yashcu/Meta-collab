import { db } from '@/lib/db'

export async function sendInvitation(
    projectId: string,
    invitedByUserId: string,
    email: string
) {
    const normalizedEmail = email.toLowerCase().trim()

    // Check inviter is admin
    const isAdmin = await db.projectMember.findFirst({
        where: { projectId, userId: invitedByUserId, role: 'ADMIN' },
    })
    if (!isAdmin) throw new Error('FORBIDDEN')

    // Check if email is already a member
    const existingMember = await db.user.findUnique({
        where: { email: normalizedEmail },
        include: {
            projectMembers: {
                where: { projectId },
            },
        },
    })
    if (existingMember?.projectMembers.length) {
        throw new Error('ALREADY_MEMBER')
    }

    // Check if pending invite already exists
    const existingInvite = await db.projectInvitation.findFirst({
        where: { projectId, email: normalizedEmail, status: 'PENDING' },
    })
    if (existingInvite) throw new Error('ALREADY_INVITED')

    return db.projectInvitation.create({
        data: {
            projectId,
            email: normalizedEmail,
            invitedByUserId,
            status: 'PENDING',
        },
        include: {
            project: { select: { name: true } },
            invitedBy: { select: { name: true, email: true } },
        },
    })
}

export async function getPendingInvitations(email: string) {
    return db.projectInvitation.findMany({
        where: {
            email: email.toLowerCase().trim(),
            status: 'PENDING',
        },
        include: {
            project: { select: { id: true, name: true, description: true } },
            invitedBy: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
    })
}

export async function respondToInvitation(
    invitationId: string,
    userId: string,
    userEmail: string,
    status: 'ACCEPTED' | 'DECLINED'
) {
    const invitation = await db.projectInvitation.findUnique({
        where: { id: invitationId },
    })

    if (!invitation) throw new Error('NOT_FOUND')
    if (invitation.status !== 'PENDING') throw new Error('ALREADY_RESPONDED')
    if (invitation.email !== userEmail.toLowerCase().trim()) {
        throw new Error('FORBIDDEN')
    }

    // Update invitation status
    const updated = await db.projectInvitation.update({
        where: { id: invitationId },
        data: {
            status,
            respondedAt: new Date(),
        },
    })

    // If accepted, create membership
    if (status === 'ACCEPTED') {
        await db.projectMember.create({
            data: {
                projectId: invitation.projectId,
                userId,
                role: 'MEMBER',
            },
        })
    }

    return updated
}

export async function getProjectInvitations(
    projectId: string,
    userId: string
) {
    // Verify requester is a member
    const member = await db.projectMember.findFirst({
        where: { projectId, userId },
    })
    if (!member) throw new Error('FORBIDDEN')

    return db.projectInvitation.findMany({
        where: { projectId },
        include: {
            invitedBy: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
    })
}