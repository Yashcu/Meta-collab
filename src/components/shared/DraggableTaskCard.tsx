'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task, TaskCard } from './TaskCard'

export function DraggableTaskCard({
    task,
    currentUserId,
    isAdmin,
    onEdit,
    onDelete,
}: {
    task: Task
    currentUserId: string
    isAdmin: boolean
    onEdit: (task: Task) => void
    onDelete: (taskId: string) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: { task },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 999 : undefined,
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TaskCard
                task={task}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        </div>
    )
}