import { createServerClient } from '../server'

/** Fetch a single site content value by key */
export async function getSiteContent(key: string): Promise<string | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', key)
    .single()

  if (error) return null
  return data?.value ?? null
}

/** Fetch multiple keys at once, returns a map */
export async function getSiteContentMany(keys: string[]): Promise<Record<string, string | null>> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('site_content')
    .select('key, value')
    .in('key', keys)

  if (error || !data) return Object.fromEntries(keys.map((k) => [k, null]))
  const map: Record<string, string | null> = Object.fromEntries(keys.map((k) => [k, null]))
  for (const row of data) map[row.key] = row.value
  return map
}
