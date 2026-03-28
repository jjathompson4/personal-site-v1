import { createServerClient } from '../server'
import type { ResumeEntry, ResumeSection } from '@/types/resume'

/** Fetch all resume entries ordered by section + sort_order */
export async function getResumeEntries(): Promise<ResumeEntry[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('resume_entries')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching resume entries:', error.message)
    return []
  }

  return (data || []) as ResumeEntry[]
}

/** Fetch entries for a specific section */
export async function getResumeSectionEntries(section: ResumeSection): Promise<ResumeEntry[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('resume_entries')
    .select('*')
    .eq('section', section)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching resume section:', error.message)
    return []
  }

  return (data || []) as ResumeEntry[]
}
