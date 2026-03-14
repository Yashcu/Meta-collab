'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Invitation = {
    id: string
    project: { id: string; name: string; description: string | null }
    invitedBy: { name: string | null; email: string }
}

export function PendingInvitations({
    invitations,
}: {
    invitations: Invitation[]
}) {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)
    const [dismissed, setDismissed] = useState<string[]>([])

    const visible = invitations.filter((inv) => !dismissed.includes(inv.id))

    if (visible.length === 0) return null

    async function respond(id: string, status: 'ACCEPTED' | 'DECLINED') {
        setLoading(id)
        try {
            const res = await fetch(`/api/invitations/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            })

            if (!res.ok) return

            setDismissed((prev) => [...prev, id])

            router.refresh()
            window.location.href = '/dashboard'
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
                Pending invitations ({visible.length})
            </h2>
            <div className="space-y-3">
                {visible.map((inv) => (
                    <Card key={inv.id} className="border-blue-100 bg-blue-50">
                        <CardContent className="py-4 flex items-center justify-between gap-4">
                            <div>
                                <p className="font-medium text-slate-800 text-sm">
                                    {inv.project.name}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Invited by {inv.invitedBy.name || inv.invitedBy.email}
                                </p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <Button
                                    size="sm"
                                    onClick={() => respond(inv.id, 'ACCEPTED')}
                                    disabled={loading === inv.id}
                                >
                                    {loading === inv.id ? 'Accepting...' : 'Accept'}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => respond(inv.id, 'DECLINED')}
                                    disabled={loading === inv.id}
                                >
                                    {loading === inv.id ? '...' : 'Decline'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}