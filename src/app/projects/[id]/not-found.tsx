import Link from 'next/link'

export default function ProjectNotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
                <p className="text-6xl font-light text-slate-200 mb-4">404</p>
                <h1 className="text-lg font-medium text-slate-700 mb-2">
                    Project not found
                </h1>
                <p className="text-sm text-slate-400 mb-6">
                    This project doesn&apos;t exist or you don&apos;t have access.
                </p>
                <Link
                    href="/dashboard"
                    className="text-sm text-blue-600 hover:underline"
                >
                    Back to dashboard
                </Link>
            </div>
        </div>
    )
}