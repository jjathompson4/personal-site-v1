export const SITE_CONFIG = {
  name: 'Personal Site',
  description: 'Personal website and portfolio',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
} as const

export const MODULE_ICONS = {
  Camera: 'Camera',
  Code: 'Code',
  Wrench: 'Wrench',
  Lightbulb: 'Lightbulb',
  Building: 'Building',
  FileText: 'FileText',
} as const

export const VISIBILITY_OPTIONS = [
  { value: 'owner', label: 'Owner Only' },
  { value: 'password', label: 'Password Protected' },
  { value: 'public', label: 'Public' },
] as const

export const DEFAULT_ACCENT_COLORS = {
  photography: '#3B82F6',
  projects: '#8B5CF6',
  wip: '#F59E0B',
  ideas: '#10B981',
  aec: '#14B8A6',
  resume: '#6B7280',
} as const
