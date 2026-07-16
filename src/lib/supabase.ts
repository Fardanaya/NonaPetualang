import { createClient } from '@supabase/supabase-js'
import { Database } from './types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
    console.error('Supabase error:', error)
    return {
        error: error.message || 'Database error occurred',
        status: error.code || 500
    }
}

// Helper function to handle single record queries
export const getSingleRecord = async (table: string, id: string, columns = '*') => {
    const { data, error } = await supabase
        .from(table)
        .select(columns)
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

// Helper function to handle multiple records queries
export const getMultipleRecords = async (table: string, columns = '*', filters = {}) => {
    let query = supabase.from(table).select(columns)

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
                query = query.in(key, value)
            } else {
                query = query.eq(key, value)
            }
        }
    })

    const { data, error } = await query

    if (error) throw error
    return data
}
