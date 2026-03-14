import { db } from '@/lib/db'

export async function getProjectTasks(projectId: string, userId: string) {
    const member = await db.projectMember.findFirst({
        where: { projectId, userId },
    })
    if (!member) throw new Error('FORBIDDEN')

    return db.task.findMany({
        where: { projectId },
        include: {
            assignedTo: {
                select: { id: true, name: true, email: true },
            },
            createdBy: {
                select: { id: true, name: true, email: true },
            },
        },
        orderBy: [{ status: 'asc' }, { order: 'asc' }],
    })
}

export async function createTask(
    projectId: string,
    userId: string,
    data: {
        title: string
        description?: string
        assignedToUserId?: string
    }
) {
    const member = await db.projectMember.findFirst({
        where: { projectId, userId },
    })
    if (!member) throw new Error('FORBIDDEN')

    // Get max order in TODO column
    const maxOrder = await db.task.aggregate({
        where: { projectId, status: 'TODO' },
        _max: { order: true },
    })

    return db.task.create({
        data: {
            projectId,
            title: data.title.trim(),
            description: data.description?.trim() || null,
            status: 'TODO',
            order: (maxOrder._max.order ?? -1) + 1,
            assignedToUserId: data.assignedToUserId || null,
            createdByUserId: userId,
        },
        include: {
            assignedTo: {
                select: { id: true, name: true, email: true },
            },
            createdBy: {
                select: { id: true, name: true, email: true },
            },
        },
    })
}

export async function updateTask(
    projectId: string,
    taskId: string,
    userId: string,
    data: {
        title?: string
        description?: string
        status?: string
        order?: number
        assignedToUserId?: string | null
    }
) {
    const member = await db.projectMember.findFirst({
        where: { projectId, userId },
    })
    if (!member) throw new Error('FORBIDDEN')

    const task = await db.task.findFirst({
        where: { id: taskId, projectId },
    })
    if (!task) throw new Error('NOT_FOUND')

    const isAdmin = member.role === 'ADMIN'
    const isCreator = task.createdByUserId === userId

    if (!isAdmin && !isCreator) throw new Error('FORBIDDEN')

    return db.task.update({
        where: { id: taskId },
        data: {
            ...(data.title !== undefined && { title: data.title.trim() }),
            ...(data.description !== undefined && {
                description: data.description?.trim() || null,
            }),
            ...(data.status !== undefined && { status: data.status }),
            ...(data.order !== undefined && { order: data.order }),
            ...(data.assignedToUserId !== undefined && {
                assignedToUserId: data.assignedToUserId,
            }),
        },
        include: {
            assignedTo: {
                select: { id: true, name: true, email: true },
            },
            createdBy: {
                select: { id: true, name: true, email: true },
            },
        },
    })
}

export async function deleteTask(
    projectId: string,
    taskId: string,
    userId: string
) {
    const member = await db.projectMember.findFirst({
        where: { projectId, userId },
    })
    if (!member) throw new Error('FORBIDDEN')

    const task = await db.task.findFirst({
        where: { id: taskId, projectId },
    })
    if (!task) throw new Error('NOT_FOUND')

    const isAdmin = member.role === 'ADMIN'
    const isCreator = task.createdByUserId === userId

    if (!isAdmin && !isCreator) throw new Error('FORBIDDEN')

    return db.task.delete({ where: { id: taskId } })
}