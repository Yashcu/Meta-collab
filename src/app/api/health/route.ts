import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const userCount = await db.user.count()
        return NextResponse.json({ ok: true, userCount })
    } catch (error) {
        return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
    }
}