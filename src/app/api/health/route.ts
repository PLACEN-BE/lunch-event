import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const checks: Record<string, string> = {}

  // 1. env vars
  checks.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING'
  checks.SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'

  // 2. Supabase connection
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('users').select('id').limit(1)
    checks.SUPABASE_QUERY = error ? `ERROR: ${error.message}` : `OK (${data?.length ?? 0} rows)`
  } catch (e) {
    checks.SUPABASE_QUERY = `THROW: ${e instanceof Error ? e.message : String(e)}`
  }

  // 3. views
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('monthly_rankings').select('*').limit(1)
    checks.MONTHLY_RANKINGS_VIEW = error ? `ERROR: ${error.message}` : 'OK'
  } catch (e) {
    checks.MONTHLY_RANKINGS_VIEW = `THROW: ${e instanceof Error ? e.message : String(e)}`
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('events').select('id').limit(1)
    checks.EVENTS_TABLE = error ? `ERROR: ${error.message}` : 'OK'
  } catch (e) {
    checks.EVENTS_TABLE = `THROW: ${e instanceof Error ? e.message : String(e)}`
  }

  return NextResponse.json(checks)
}
