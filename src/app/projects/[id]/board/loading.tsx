import { Skeleton } from '@/components/ui/skeleton'

export default function BoardLoading() {
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="h-5 w-40 bg-slate-100 rounded animate-pulse" />
                    <div className="h-8 w-28 bg-slate-100 rounded animate-pulse" />
                </div>
            </header>
            <main className="max-w-6xl mx-auto px-6 py-6">
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((col) => (
                        <div
                            key={col}
                            className="bg-slate-100 rounded-xl p-3 min-h-[500px] space-y-2"
                        >
                            <Skeleton className="h-6 w-20 mb-4" />
                            {[1, 2, 3].map((card) => (
                                <div
                                    key={card}
                                    className="bg-white rounded-lg p-3 space-y-2"
                                >
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-2/3" />
                                    <Skeleton className="h-3 w-1/3 mt-2" />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}