'use client'

export type Task = {
    id: string
    title: string
    description: string | null
    status: string
    order: number
    projectId: string
    assignedTo: { id: string; name: string | null; email: string } | null
    createdBy: { id: string; name: string | null; email: string }
    createdAt: string
    updatedAt: string
}

export function TaskCard({
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
    const isCreator = task.createdBy.id === currentUserId
    const canEdit = isCreator || isAdmin
    const canDelete = isCreator || isAdmin

    function getInitials(user: { name: string | null; email: string }) {
        if (user.name) {
            return user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        }
        return user.email[0].toUpperCase()
    }

    return (
        <div
            className={`bg-white border border-slate-200 rounded-lg p-3 shadow-sm transition-shadow group ${canEdit
                    ? 'cursor-pointer hover:shadow-md'
                    : 'cursor-default opacity-90'
                }`}
            onClick={() => canEdit && onEdit(task)}
        >
            <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-slate-800 leading-snug flex-1">
                    {task.title}
                </p>
                {canDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete(task.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all text-lg leading-none shrink-0 w-5 h-5 flex items-center justify-center"
                        title="Delete task"
                    >
                        ×
                    </button>
                )}
            </div>

            {task.description && (
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {task.description}
                </p>
            )}

            <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-slate-400">
                    {task.createdBy.name || task.createdBy.email}
                </span>
                {task.assignedTo && (
                    <div
                        className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-medium flex items-center justify-center shrink-0"
                        title={`Assigned to ${task.assignedTo.name || task.assignedTo.email}`}
                    >
                        {getInitials(task.assignedTo)}
                    </div>
                )}
            </div>
        </div>
    )
}