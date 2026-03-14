import { db } from '@/lib/db'

export async function syncUser(clerkId: string, email: string, name?: string) {
    return db.user.upsert({
        where: { clerkId },
        update: {
            email,
            name: name ?? null,
        },
        create: {
            clerkId,
            email,
            name: name ?? null,
        },
    })
}

export async function getUserByClerkId(clerkId: string) {
    return db.user.findUnique({
        where: { clerkId },
    })
}

export async function isProjectMember(projectId: string, userId: string) {
    return db.projectMember.findFirst({
        where: { projectId, userId },
    })
}

export async function isProjectAdmin(projectId: string, userId: string) {
    return db.projectMember.findFirst({
        where: { projectId, userId, role: 'ADMIN' },
    })
}

export async function requireProjectMember(projectId: string, userId: string) {
    const member = await isProjectMember(projectId, userId)
    if (!member) throw new Error('FORBIDDEN')
    return member
}

export async function requireProjectAdmin(projectId: string, userId: string) {
    const member = await isProjectAdmin(projectId, userId)
    if (!member) throw new Error('FORBIDDEN')
    return member
}