import { createClient } from '@supabase/supabase-js'
import type { Signature } from '@/app/types'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false
    }
  }
)

export async function createSignature(data: Omit<Signature, 'id' | 'created_at' | 'verified_at'>): Promise<Signature> {
  const { data: signature, error } = await supabase
    .from('signatures')
    .insert([{
      name: data.name,
      email: data.email,
      job_title: data.job_title,
      affiliation: data.affiliation,
      honors: data.honors,
      is_notable: data.is_notable,
      verification_token: data.verification_token,
      status: data.status
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating signature:', error)
    throw error
  }

  return signature
}

export async function getSignatureByEmail(email: string): Promise<Signature | null> {
  const { data: signature, error } = await supabase
    .from('signatures')
    .select()
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error('Error getting signature by email:', error)
    throw error
  }

  return signature
}

export async function getSignatures(search?: string): Promise<Signature[]> {
  try {
    let query = supabase
      .from('signatures')
      .select()
      .eq('status', 'verified')
      .order('is_notable', { ascending: false })
      .order('created_at', { ascending: true })

    if (search) {
      query = query.or(`name.ilike.%${search}%,job_title.ilike.%${search}%,affiliation.ilike.%${search}%,honors.ilike.%${search}%`)
    }

    const { data: signatures, error } = await query

    if (error) {
      console.error('Supabase error getting signatures:', error)
      throw error
    }

    console.log('Successfully fetched signatures:', signatures?.length || 0)
    return signatures || []
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error in getSignatures:', err.message)
      throw err
    }
    throw new Error('Unknown error in getSignatures')
  }
}

export async function verifySignature(token: string): Promise<Signature | null> {
  try {
    const { data: signature, error } = await supabase
      .from('signatures')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString()
      })
      .eq('verification_token', token)
      .eq('status', 'pending')
      .select()
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error verifying signature:', error)
      throw error
    }

    return signature
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error in verifySignature:', err.message)
      throw err
    }
    throw new Error('Unknown error in verifySignature')
  }
}

export const testConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase  // Remove 'data' from destructuring
      .from('signatures')
      .select('count')
      .limit(1)
    
    if (error) throw error
    return true
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Database connection test failed:', err.message)
    } else {
      console.error('Database connection test failed with unknown error')
    }
    return false
  }
}