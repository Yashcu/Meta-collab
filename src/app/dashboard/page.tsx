import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const { userId } = await auth()

    if (!userId) {
        redirect('/sign-in')
    }

    const user = await currentUser()

    return (
        <main className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
                <p className="mt-2 text-slate-500">
                    Signed in as{' '}
                    <span className="font-medium text-slate-700">
                        {user?.emailAddresses[0]?.emailAddress}
                    </span>
                </p>
                <p className="mt-1 text-xs text-slate-400">Clerk ID: {userId}</p>
            </div>
        </main>
    )
}