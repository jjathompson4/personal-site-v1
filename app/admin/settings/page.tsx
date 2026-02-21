'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'

interface SettingsState {
    site_title: string
    site_description: string
    email: string
    about: {
        name: string
        title: string
        bio: string
        // Preserved passthrough — not editable here but must not be lost on save
        photo?: string | null
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        social_links?: any[]
    }
}

const EMPTY: SettingsState = {
    site_title: '',
    site_description: '',
    email: '',
    about: { name: '', title: '', bio: '' },
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<SettingsState>(EMPTY)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetch('/api/settings')
            .then(r => r.json())
            .then(({ settings: s }) => {
                setSettings({
                    site_title: s?.site_title ?? '',
                    site_description: s?.site_description ?? '',
                    email: s?.email ?? '',
                    about: {
                        name: s?.about?.name ?? '',
                        title: s?.about?.title ?? '',
                        bio: s?.about?.bio ?? '',
                        // Preserve fields we don't edit so they aren't wiped on save
                        photo: s?.about?.photo ?? null,
                        social_links: s?.about?.social_links ?? [],
                    },
                })
            })
            .catch(() => toast.error('Failed to load settings'))
            .finally(() => setLoading(false))
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            })
            if (!res.ok) throw new Error('Failed to save')
            toast.success('Settings saved')
        } catch {
            toast.error('Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    const set = (field: keyof Omit<SettingsState, 'about'>, value: string) =>
        setSettings(prev => ({ ...prev, [field]: value }))

    const setAbout = (field: keyof SettingsState['about'], value: string) =>
        setSettings(prev => ({ ...prev, about: { ...prev.about, [field]: value } }))

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-2xl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Site Settings</h2>
                    <p className="text-muted-foreground">Changes appear on the homepage immediately after saving.</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save
                </Button>
            </div>

            {/* Site */}
            <section className="space-y-4 p-6 rounded-xl border bg-card">
                <h3 className="font-semibold text-lg">Site Identity</h3>

                <div className="space-y-2">
                    <Label htmlFor="site_title">Site / Name</Label>
                    <Input
                        id="site_title"
                        value={settings.site_title}
                        onChange={e => set('site_title', e.target.value)}
                        placeholder="Jeff Thompson"
                    />
                    <p className="text-xs text-muted-foreground">Shown in the header and browser tab.</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="site_description">Tagline / Subtitle</Label>
                    <Input
                        id="site_description"
                        value={settings.site_description}
                        onChange={e => set('site_description', e.target.value)}
                        placeholder="Lighting Design & Software Craft"
                    />
                    <p className="text-xs text-muted-foreground">One-liner shown beneath your name on the homepage.</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={settings.email}
                        onChange={e => set('email', e.target.value)}
                        placeholder="you@example.com"
                    />
                </div>
            </section>

            {/* About / Hero Bio */}
            <section className="space-y-4 p-6 rounded-xl border bg-card">
                <h3 className="font-semibold text-lg">Homepage Bio</h3>
                <p className="text-sm text-muted-foreground">
                    This appears as a short intro above the content stream, so new visitors know what the site is about.
                </p>

                <div className="space-y-2">
                    <Label htmlFor="about_name">Display Name</Label>
                    <Input
                        id="about_name"
                        value={settings.about.name}
                        onChange={e => setAbout('name', e.target.value)}
                        placeholder="Jeff Thompson"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="about_title">Professional Title</Label>
                    <Input
                        id="about_title"
                        value={settings.about.title}
                        onChange={e => setAbout('title', e.target.value)}
                        placeholder="Lighting Designer & Software Engineer"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="about_bio">Bio / Intro</Label>
                    <Textarea
                        id="about_bio"
                        value={settings.about.bio}
                        onChange={e => setAbout('bio', e.target.value)}
                        placeholder="A sentence or two introducing yourself and what visitors will find here…"
                        className="min-h-[100px] resize-y"
                    />
                    <p className="text-xs text-muted-foreground">Keep it to 1–3 sentences. Markdown is not rendered here.</p>
                </div>
            </section>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                </Button>
            </div>
        </div>
    )
}
