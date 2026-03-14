import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center gap-4">
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-slate-900">MetaCollab</h1>
        <p className="mt-2 text-slate-500">Collaborative project management</p>
        <Button className="mt-6">Get started</Button>
      </div>
    </main>
  )
}