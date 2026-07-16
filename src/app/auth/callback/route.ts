import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error, data } = await supabase.auth.exchangeCodeForSession(code)
        if (!error && data.user) {
            // Check if user has completed their profile by checking required fields
            const { data: userProfile } = await supabase
                .from('users')
                .select('full_name, phone_whatsapp, emergency_contact, identity_pict')
                .eq('id', data.user.id)
                .single()

            // Profile is complete if all required fields are filled
            const isProfileComplete = userProfile &&
                userProfile.full_name &&
                userProfile.phone_whatsapp &&
                userProfile.emergency_contact &&
                userProfile.identity_pict

            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'

            // Determine the redirect URL based on profile completion status
            const redirectPath = isProfileComplete ? next : '/profile-setup'

            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${origin}${redirectPath}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
            } else {
                return NextResponse.redirect(`${origin}${redirectPath}`)
            }
        } else if (error) {
            // Handle auth errors silently without logging
            if (error?.message.includes('invalid_grant')) {
                // Redirect to auth error page for any auth-related issues
                return NextResponse.redirect(`${origin}/auth/auth-code-error`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
