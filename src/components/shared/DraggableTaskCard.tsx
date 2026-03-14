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
        transition: isDragging ? 'none' : transition,
        opacity: isDragging ? 0.35 : 1,
        position: isDragging ? ('relative' as const) : undefined,
        zIndex: isDragging ? 999 : undefined,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="touch-none"
        >
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