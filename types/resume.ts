export type ResumeSection = 'identity' | 'experience' | 'projects' | 'education' | 'skills'

export interface ResumeEntry {
  id: string
  created_at: string
  updated_at: string
  section: ResumeSection
  sort_order: number
  title: string | null
  subtitle: string | null
  location: string | null
  date_range: string | null
  description: string | null
  mood_preset: string | null
}

export type ResumeEntryFormData = Omit<ResumeEntry, 'id' | 'created_at' | 'updated_at'>
