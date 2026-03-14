import { db } from '@/lib/db'

export async function getUserProjects(userId: string) {
    const memberships = await db.projectMember.findMany({
        where: { userId },
        include: {
            project: {
                include: {
                    _count: {
                        select: { members: true, tasks: true },
                    },
                },
            },
        },
        orderBy: {
            project: { updatedAt: 'desc' },
        },
    })

    return memberships.map((m) => ({
        ...m.project,
        role: m.role,
    }))
}

export async function createProject(
    userId: string,
    data: { name: string; description?: string }
) {
    return db.project.create({
        data: {
            name: data.name,
            description: data.description ?? null,
            adminId: userId,
            members: {
                create: {
                    userId,
                    role: 'ADMIN',
                },
            },
        },
        include: {
            _count: {
                select: { members: true, tasks: true },
            },
        },
    })
}

export async function getProjectById(projectId: string, userId: string) {
    const member = await db.projectMember.findFirst({
        where: { projectId, userId },
    })

    if (!member) return null

    return db.project.findUnique({
        where: { id: projectId },
        include: {
            members: {
                include: { user: true },
            },
            _count: {
                select: { tasks: true },
            },
        },
    })
}

export async function deleteProject(projectId: string, userId: string) {
    const member = await db.projectMember.findFirst({
        where: { projectId, userId, role: 'ADMIN' },
    })

    if (!member) throw new Error('FORBIDDEN')

    return db.project.delete({
        where: { id: projectId },
    })
}