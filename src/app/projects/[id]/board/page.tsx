import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import { getProjectById } from '@/lib/services/project.service'
import { InviteModal } from '@/components/shared/InviteModal'
import Link from 'next/link'

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
    const project = await getProjectById(id, dbUser.id)

    if (!project) redirect('/dashboard')

    const isAdmin = project.members.find(
        (m) => m.userId === dbUser.id
    )?.role === 'ADMIN'

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="text-sm text-slate-400 hover:text-slate-600"
                        >
                            Dashboard
                        </Link>
                        <span className="text-slate-300">/</span>
                        <h1 className="text-base font-semibold text-slate-900">
                            {project.name}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                            {project.members.length} member{project.members.length !== 1 ? 's' : ''}
                        </span>
                        {isAdmin && <InviteModal projectId={project.id} />}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12 text-center">
                <p className="text-slate-400">Kanban board coming Day 8</p>
            </main>
        </div>
    )
}