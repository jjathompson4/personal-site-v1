import { MoodPresetsEditor } from '@/components/admin/MoodPresetsEditor'
import { getMoodOverrides } from '@/lib/getMoodPresets'

export default async function AdminMoodsPage() {
  const overrides = await getMoodOverrides()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Mood Presets</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tweak the default LCH values for each atmosphere preset. Changes apply site-wide.
        </p>
      </div>
      <MoodPresetsEditor initialOverrides={overrides} />
    </div>
  )
}
