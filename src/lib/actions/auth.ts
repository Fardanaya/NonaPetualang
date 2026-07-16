'use server'
import { createClient } from "../supabase/server"
import { redirect } from 'next/navigation'

export const handleGoogleSignIn = async () => {
    const supabase = await createClient()

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${baseUrl}/auth/callback`,
        },
    })

    if (error) {
        console.error('Error signing in with Google:', error)
        return
    }

    if (data) {
        console.log('Google sign-in data:', data)
        redirect(data.url) // Redirect to the URL provided by Supabase
        // Handle the response as needed
    }
}