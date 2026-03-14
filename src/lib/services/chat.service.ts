import { db } from '@/lib/db'

export async function sendMessage(
    projectId: string,
    userId: string,
    message: string
) {
    const member = await db.projectMember.findFirst({
        where: { projectId, userId },
    })
    if (!member) throw new Error('FORBIDDEN')

    if (!message || message.trim().length === 0) {
        throw new Error('EMPTY_MESSAGE')
    }

    if (message.trim().length > 500) {
        throw new Error('MESSAGE_TOO_LONG')
    }

    return db.chatMessage.create({
        data: {
            projectId,
            userId,
            message: message.trim(),
        },
        include: {
            user: { select: { id: true, name: true, email: true } },
        },
    })
}

export async function pollMessages(
    projectId: string,
    userId: string,
    since: string | null
) {
    const member = await db.projectMember.findFirst({
        where: { projectId, userId },
    })
    if (!member) throw new Error('FORBIDDEN')

    const sinceDate = since ? new Date(since) : new Date(0)

    const messages = await db.chatMessage.findMany({
        where: {
            projectId,
            createdAt: { gt: sinceDate },
        },
        include: {
            user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'asc' },
        take: 50,
    })

    // Get active users (heartbeat within last 2 minutes)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)
    const activeUsers = await db.activeUser.findMany({
        where: {
            projectId,
            lastHeartbeat: { gt: twoMinutesAgo },
        },
        include: {
            project: false,
        },
    })

    // Get user details for active users
    const activeUserDetails = await db.user.findMany({
        where: {
            id: { in: activeUsers.map((u) => u.userId) },
        },
        select: { id: true, name: true, email: true },
    })

    return {
        messages,
        activeUsers: activeUserDetails,
        timestamp: new Date().toISOString(),
    }
}

export async function updateHeartbeat(projectId: string, userId: string) {
    const member = await db.projectMember.findFirst({
        where: { projectId, userId },
    })
    if (!member) throw new Error('FORBIDDEN')

    return db.activeUser.upsert({
        where: {
            projectId_userId: { projectId, userId },
        },
        update: {
            lastHeartbeat: new Date(),
        },
        create: {
            projectId,
            userId,
            lastHeartbeat: new Date(),
        },
    })
}

export async function cleanupEphemeralMessages(projectId: string) {
    // Check if anyone is active in this project
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)
    const activeCount = await db.activeUser.count({
        where: {
            projectId,
            lastHeartbeat: { gt: twoMinutesAgo },
        },
    })

    // If no one active, delete all messages for this project
    if (activeCount === 0) {
        await db.chatMessage.deleteMany({ where: { projectId } })
        return true
    }

    return false
}