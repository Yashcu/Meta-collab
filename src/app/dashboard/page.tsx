import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import { getUserProjects } from '@/lib/services/project.service'
import { getPendingInvitations } from '@/lib/services/invitation.service'
import { ProjectCard, type ProjectCardData } from '@/components/shared/ProjectCard'
import { CreateProjectModal } from '@/components/shared/CreateProjectModal'
import { PendingInvitations } from '@/components/shared/PendingInvitations'
import { SignOutButton } from '@clerk/nextjs'

export default async function DashboardPage() {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')

    const dbUser = await getAuthUser()
    if (!dbUser) redirect('/sign-in')

    const [projects, invitations] = await Promise.all([
        getUserProjects(dbUser.id),
        getPendingInvitations(dbUser.email),
    ])

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-slate-900">MetaCollab</h1>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500">{dbUser.name}</span>
                        <CreateProjectModal />
                        <SignOutButton>
                            <button className="text-sm text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded hover:bg-slate-100">
                                Sign out
                            </button>
                        </SignOutButton>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8">
                <PendingInvitations invitations={invitations} />

                {projects.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-slate-400 text-lg">No projects yet</p>
                        <p className="text-slate-400 text-sm mt-1">
                            Create your first project to get started
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                                Your projects ({projects.length})
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {projects.map((project: ProjectCardData) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}