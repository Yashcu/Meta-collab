import { auth, currentUser } from '@clerk/nextjs/server'
import { syncUser } from '@/lib/services/auth.service'

export async function getAuthUser() {
    const { userId: clerkId } = await auth()

    if (!clerkId) return null

    const clerkUser = await currentUser()
    if (!clerkUser) return null

    const email = clerkUser.emailAddresses[0]?.emailAddress
    if (!email) return null

    const fullName = [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(' ')
        .trim()

    const emailPrefix = email.split('@')[0]

    const name = fullName || clerkUser.username || emailPrefix

    const dbUser = await syncUser(clerkId, email, name)

    return dbUser
}