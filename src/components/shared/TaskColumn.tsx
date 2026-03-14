'use client'

import { Task, TaskCard } from './TaskCard'

const COLUMN_CONFIG = {
    TODO: { label: 'To do', color: 'bg-slate-100 text-slate-600' },
    IN_PROGRESS: { label: 'In progress', color: 'bg-blue-100 text-blue-700' },
    DONE: { label: 'Done', color: 'bg-green-100 text-green-700' },
}

export function TaskColumn({
    status,
    tasks,
    currentUserId,
    onAddTask,
    onEditTask,
    onDeleteTask,
}: {
    status: 'TODO' | 'IN_PROGRESS' | 'DONE'
    tasks: Task[]
    currentUserId: string
    onAddTask: (status: string) => void
    onEditTask: (task: Task) => void
    onDeleteTask: (taskId: string) => void
}) {
    const config = COLUMN_CONFIG[status]

    return (
        <div className="flex flex-col bg-slate-100 rounded-xl p-3 min-h-[500px]">
            {/* Column header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${config.color}`}>
                        {config.label}
                    </span>
                    <span className="text-xs font-medium text-slate-400">{tasks.length}</span>
                </div>
                <button
                    onClick={() => onAddTask(status)}
                    className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors text-lg font-light"
                    title={`Add task`}
                >
                    +
                </button>
            </div>

            {/* Task cards */}
            <div className="flex flex-col gap-2 flex-1">
                {tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        currentUserId={currentUserId}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                    />
                ))}

                {/* Empty state */}
                {tasks.length === 0 && (
                    <button
                        onClick={() => onAddTask(status)}
                        className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-colors min-h-[120px] gap-1"
                    >
                        <span className="text-slate-300 text-2xl font-light">+</span>
                        <span className="text-xs text-slate-300">Add a task</span>
                    </button>
                )}
            </div>
        </div>
    )
}