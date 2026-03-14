import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const { userId } = await auth()

  if (userId) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-slate-900">MetaCollab</h1>
        <p className="mt-2 text-slate-500">Collaborative project management</p>
        <div className="mt-8 flex gap-3 justify-center">
          <Button asChild>
            <Link href="/sign-up">Get started</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}