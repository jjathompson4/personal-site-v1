import { MoodPresetsEditor } from '@/components/admin/MoodPresetsEditor'
import { CustomPresetsEditor } from '@/components/admin/CustomPresetsEditor'
import { getMoodOverrides, getCustomPresets } from '@/lib/getMoodPresets'

export default async function AdminMoodsPage() {
  const [overrides, customPresets] = await Promise.all([
    getMoodOverrides(),
    getCustomPresets(),
  ])

  return (
    <div className="space-y-10">
      {/* Custom presets — create new moods */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Custom Presets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create new atmosphere presets. They appear alongside built-in moods everywhere.
          </p>
        </div>
        <CustomPresetsEditor initialPresets={customPresets} />
      </div>

      {/* Built-in presets — tweak defaults */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Built-in Presets</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tweak the default LCH values for each built-in atmosphere preset. Changes apply site-wide.
          </p>
        </div>
        <MoodPresetsEditor initialOverrides={overrides} />
      </div>
    </div>
  )
}
