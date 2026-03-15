import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Project = {
    id: string
    name: string
    description: string | null
    role: string
    _count: { members: number; tasks: number }
}

export type ProjectCardData = {
    id: string
    name: string
    description: string | null
    role: string
    _count: { members: number; tasks: number }
}

export function ProjectCard({ project }: { project: Project }) {
    return (
        <Link href={`/projects/${project.id}/board`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base font-medium leading-tight">
                            {project.name}
                        </CardTitle>
                        {project.role === 'ADMIN' && (
                            <Badge variant="secondary" className="text-xs shrink-0">
                                Admin
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {project.description && (
                        <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                            {project.description}
                        </p>
                    )}
                    <div className="flex gap-3 text-xs text-slate-400">
                        <span>{project._count.members} member{project._count.members !== 1 ? 's' : ''}</span>
                        <span>·</span>
                        <span>{project._count.tasks} task{project._count.tasks !== 1 ? 's' : ''}</span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}