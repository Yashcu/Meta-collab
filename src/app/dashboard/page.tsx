import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'

export default async function DashboardPage() {
    const { userId } = await auth()

    if (!userId) {
        redirect('/sign-in')
    }

    const dbUser = await getAuthUser()

    if (!dbUser) {
        redirect('/sign-in')
    }

    return (
        <main className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
                <p className="mt-2 text-slate-500">
                    Signed in as{' '}
                    <span className="font-medium text-slate-700">{dbUser.email}</span>
                </p>
                <div className="mt-4 space-y-1 text-xs text-slate-400">
                    <p>Clerk ID: {dbUser.clerkId}</p>
                    <p>DB ID: {dbUser.id}</p>
                </div>
            </div>
        </main>
    )
}