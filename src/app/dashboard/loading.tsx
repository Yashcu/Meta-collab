import { DashboardSkeleton } from '@/components/shared/DashboardSkeleton'

export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="h-6 w-28 bg-slate-100 rounded animate-pulse" />
                    <div className="h-8 w-32 bg-slate-100 rounded animate-pulse" />
                </div>
            </header>
            <DashboardSkeleton />
        </div>
    )
}