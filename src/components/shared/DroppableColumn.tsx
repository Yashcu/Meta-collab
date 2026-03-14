'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task } from './TaskCard'
import { DraggableTaskCard } from './DraggableTaskCard'

const COLUMN_CONFIG = {
    TODO: { label: 'To do', color: 'bg-slate-100 text-slate-600' },
    IN_PROGRESS: { label: 'In progress', color: 'bg-blue-100 text-blue-700' },
    DONE: { label: 'Done', color: 'bg-green-100 text-green-700' },
}

export function DroppableColumn({
    status,
    tasks,
    currentUserId,
    isAdmin,
    isOver,
    onAddTask,
    onEditTask,
    onDeleteTask,
}: {
    status: 'TODO' | 'IN_PROGRESS' | 'DONE'
    tasks: Task[]
    currentUserId: string
    isAdmin: boolean
    isOver: boolean
    onAddTask: (status: string) => void
    onEditTask: (task: Task) => void
    onDeleteTask: (taskId: string) => void
}) {
    const config = COLUMN_CONFIG[status]
    const { setNodeRef } = useDroppable({ id: status })

    return (
        <div
            className={`flex flex-col rounded-xl p-3 min-h-[500px] transition-colors ${isOver ? 'bg-blue-50 ring-2 ring-blue-200' : 'bg-slate-100'
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${config.color}`}
                    >
                        {config.label}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                        {tasks.length}
                    </span>
                </div>
                <button
                    onClick={() => onAddTask(status)}
                    className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors text-lg font-light"
                    title="Add task"
                >
                    +
                </button>
            </div>

            {/* Droppable area */}
            <SortableContext
                items={tasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
            >
                <div ref={setNodeRef} className="flex flex-col gap-2 flex-1">
                    {tasks.map((task) => (
                        <DraggableTaskCard
                            key={task.id}
                            task={task}
                            currentUserId={currentUserId}
                            isAdmin={isAdmin}
                            onEdit={onEditTask}
                            onDelete={onDeleteTask}
                        />
                    ))}

                    {tasks.length === 0 && (
                        <button
                            onClick={() => onAddTask(status)}
                            className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-colors min-h-[120px] gap-1 ${isOver
                                    ? 'border-blue-300 bg-blue-50'
                                    : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                                }`}
                        >
                            <span className="text-slate-300 text-2xl font-light">+</span>
                            <span className="text-xs text-slate-300">Add a task</span>
                        </button>
                    )}
                </div>
            </SortableContext>
        </div>
    )
}