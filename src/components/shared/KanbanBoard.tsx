'use client'

import { useState, useEffect, useCallback } from 'react'
import { TaskColumn } from './TaskColumn'
import { Task } from './TaskCard'

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'] as const

type Member = { id: string; name: string | null; email: string; role: string }

export function KanbanBoard({
    projectId,
    currentUserId,
    isAdmin,
    initialTasks,
}: {
    projectId: string
    currentUserId: string
    isAdmin: boolean
    initialTasks: Task[]
}) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const [members, setMembers] = useState<Member[]>([])
    const [addingToStatus, setAddingToStatus] = useState<string | null>(null)
    const [editingTask, setEditingTask] = useState<Task | null>(null)

    const pollTasks = useCallback(async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/tasks`)
            if (!res.ok) return
            const data = await res.json()
            setTasks(data.tasks)
        } catch {
            // silent fail
        }
    }, [projectId])

    useEffect(() => {
        async function fetchMembers() {
            try {
                const res = await fetch(`/api/projects/${projectId}/members`)
                if (!res.ok) return
                const data = await res.json()
                setMembers(data.members)
            } catch {
                // silent fail
            }
        }
        fetchMembers()
    }, [projectId])

    useEffect(() => {
        const interval = setInterval(pollTasks, 5000)
        return () => clearInterval(interval)
    }, [pollTasks])

    function getTasksByStatus(status: string) {
        return tasks
            .filter((t) => t.status === status)
            .sort((a, b) => a.order - b.order)
    }

    async function handleDeleteTask(taskId: string) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId))
        try {
            const res = await fetch(
                `/api/projects/${projectId}/tasks/${taskId}`,
                { method: 'DELETE' }
            )
            if (!res.ok) await pollTasks()
        } catch {
            await pollTasks()
        }
    }

    return (
        <>
            <div className="grid grid-cols-3 gap-4 w-full">
                {STATUSES.map((status) => (
                    <TaskColumn
                        key={status}
                        status={status}
                        tasks={getTasksByStatus(status)}
                        currentUserId={currentUserId}
                        isAdmin={isAdmin}
                        onAddTask={(s) => setAddingToStatus(s)}
                        onEditTask={(task) => setEditingTask(task)}
                        onDeleteTask={handleDeleteTask}
                    />
                ))}
            </div>

            {addingToStatus && (
                <AddTaskModal
                    projectId={projectId}
                    status={addingToStatus}
                    members={members}
                    onClose={() => setAddingToStatus(null)}
                    onCreated={(task) => {
                        setTasks((prev) => [...prev, task])
                        setAddingToStatus(null)
                    }}
                />
            )}

            {editingTask && (
                <EditTaskModal
                    projectId={projectId}
                    task={editingTask}
                    members={members}
                    onClose={() => setEditingTask(null)}
                    onUpdated={(updated) => {
                        setTasks((prev) =>
                            prev.map((t) => (t.id === updated.id ? updated : t))
                        )
                        setEditingTask(null)
                    }}
                />
            )}
        </>
    )
}

function AddTaskModal({
    projectId,
    status,
    members,
    onClose,
    onCreated,
}: {
    projectId: string
    status: string
    members: Member[]
    onClose: () => void
    onCreated: (task: Task) => void
}) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [assignedToUserId, setAssignedToUserId] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!title.trim()) { setError('Title is required'); return }
        setLoading(true)
        try {
            const res = await fetch(`/api/projects/${projectId}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    assignedToUserId: assignedToUserId || undefined,
                }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error || 'Failed to create task'); return }
            onCreated(data.task)
        } catch {
            setError('Failed to create task')
        } finally {
            setLoading(false)
        }
    }

    return (
        <ModalBackdrop onClose={onClose}>
            <div className="bg-white rounded-xl w-full max-w-md shadow-xl flex flex-col max-h-[90vh]">
                <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                    <h2 className="text-base font-semibold text-slate-900">Add task</h2>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Title</label>
                            <input
                                autoFocus
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="What needs to be done?"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={100}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">
                                Description{' '}
                                <span className="font-normal text-slate-400">(optional)</span>
                            </label>
                            <textarea
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Add more details..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">
                                Assign to{' '}
                                <span className="font-normal text-slate-400">(optional)</span>
                            </label>
                            <select
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={assignedToUserId}
                                onChange={(e) => setAssignedToUserId(e.target.value)}
                            >
                                <option value="">Unassigned</option>
                                {members.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.name || m.email}
                                        {m.role === 'ADMIN' ? ' (Admin)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {error && <p className="text-xs text-red-500">{error}</p>}
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 bg-white rounded-b-xl">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Adding...' : 'Add task'}
                        </button>
                    </div>
                </form>
            </div>
        </ModalBackdrop>
    )
}

function EditTaskModal({
    projectId,
    task,
    members,
    onClose,
    onUpdated,
}: {
    projectId: string
    task: Task
    members: Member[]
    onClose: () => void
    onUpdated: (task: Task) => void
}) {
    const [title, setTitle] = useState(task.title)
    const [description, setDescription] = useState(task.description || '')
    const [status, setStatus] = useState(task.status)
    const [assignedToUserId, setAssignedToUserId] = useState(
        task.assignedTo?.id || ''
    )
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!title.trim()) { setError('Title is required'); return }
        setLoading(true)
        try {
            const res = await fetch(
                `/api/projects/${projectId}/tasks/${task.id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title,
                        description,
                        status,
                        assignedToUserId: assignedToUserId || null,
                    }),
                }
            )
            const data = await res.json()
            if (!res.ok) { setError(data.error || 'Failed to update task'); return }
            onUpdated(data.task)
        } catch {
            setError('Failed to update task')
        } finally {
            setLoading(false)
        }
    }

    return (
        <ModalBackdrop onClose={onClose}>
            <div className="bg-white rounded-xl w-full max-w-md shadow-xl flex flex-col max-h-[90vh]">
                <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                    <h2 className="text-base font-semibold text-slate-900">Edit task</h2>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Title</label>
                            <input
                                autoFocus
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Task title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={100}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">
                                Description{' '}
                                <span className="font-normal text-slate-400">(optional)</span>
                            </label>
                            <textarea
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Add more details..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Status</label>
                            <select
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="TODO">To do</option>
                                <option value="IN_PROGRESS">In progress</option>
                                <option value="DONE">Done</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">
                                Assign to{' '}
                                <span className="font-normal text-slate-400">(optional)</span>
                            </label>
                            <select
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={assignedToUserId}
                                onChange={(e) => setAssignedToUserId(e.target.value)}
                            >
                                <option value="">Unassigned</option>
                                {members.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.name || m.email}
                                        {m.role === 'ADMIN' ? ' (Admin)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {error && <p className="text-xs text-red-500">{error}</p>}
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 bg-white rounded-b-xl">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Saving...' : 'Save changes'}
                        </button>
                    </div>
                </form>
            </div>
        </ModalBackdrop>
    )
}

function ModalBackdrop({
    children,
    onClose,
}: {
    children: React.ReactNode
    onClose: () => void
}) {
    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div onClick={(e) => e.stopPropagation()}>{children}</div>
        </div>
    )
}