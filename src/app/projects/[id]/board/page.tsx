import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import { getProjectById } from '@/lib/services/project.service'
import { getProjectTasks } from '@/lib/services/task.service'
import { KanbanBoard } from '@/components/shared/KanbanBoard'
import { InviteModal } from '@/components/shared/InviteModal'
import Link from 'next/link'
import { BoardErrorBoundary } from '@/components/shared/BoardErrorBoundary'

export default async function BoardPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')

    const dbUser = await getAuthUser()
    if (!dbUser) redirect('/sign-in')

    const { id } = await params

    const [project, tasks] = await Promise.all([
        getProjectById(id, dbUser.id),
        getProjectTasks(id, dbUser.id).catch(() => []),
    ])

    if (!project) redirect('/dashboard')

    const isAdmin =
        project.members.find((m) => m.userId === dbUser.id)?.role === 'ADMIN'

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Dashboard
                        </Link>
                        <span className="text-slate-300">/</span>
                        <h1 className="text-base font-semibold text-slate-900">
                            {project.name}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {project.members.slice(0, 4).map((m) => (
                                <div
                                    key={m.userId}
                                    className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-medium flex items-center justify-center border-2 border-white"
                                    title={m.user.name || m.user.email}
                                >
                                    {(m.user.name || m.user.email)[0].toUpperCase()}
                                </div>
                            ))}
                            {project.members.length > 4 && (
                                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-xs font-medium flex items-center justify-center border-2 border-white">
                                    +{project.members.length - 4}
                                </div>
                            )}
                        </div>
                        {isAdmin && <InviteModal projectId={project.id} />}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-6 overflow-x-auto">
                <div className="min-w-[700px]">
                    <BoardErrorBoundary>
                        <KanbanBoard
                            projectId={project.id}
                            currentUserId={dbUser.id}
                            isAdmin={isAdmin}
                            initialTasks={tasks as any}
                        />
                    </BoardErrorBoundary>
                </div>
            </main>
        </div>
    )
}