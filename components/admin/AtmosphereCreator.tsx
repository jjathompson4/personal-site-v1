'use client'

import { useState } from 'react'
import { moods as hardcodedMoods, moodKeys } from '@/components/atmosphere/moods'
import { useAtmosphere } from '@/components/atmosphere/AtmosphereProvider'
import { cn } from '@/lib/utils'
import type { MoodKey, MoodPalette } from '@/components/atmosphere/moods'

// ─── OKLCH helpers ────────────────────────────────────────────────────────────

export interface Oklch { l: number; c: number; h: number }

export function parseOklch(val: string): Oklch {
    const m = val.match(/oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)/)
    if (!m) return { l: 50, c: 0.05, h: 200 }
    return { l: parseFloat(m[1]), c: parseFloat(m[2]), h: parseFloat(m[3]) }
}

export function stringifyOklch({ l, c, h }: Oklch): string {
    return `oklch(${l.toFixed(1)}% ${c.toFixed(3)} ${Math.round(h)})`
}

// ─── Single gradient stop editor ──────────────────────────────────────────────

export function StopEditor({
    label,
    value,
    onChange,
}: {
    label: string
    value: string
    onChange: (val: string) => void
}) {
    const oklch = parseOklch(value)

    const set = (key: keyof Oklch, raw: number) =>
        onChange(stringifyOklch({ ...oklch, [key]: raw }))

    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-2">
                <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/10"
                    style={{ background: value }}
                />
                <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <div className="space-y-1 pl-6">
                {/* Lightness */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground/50 w-3">L</span>
                    <input
                        type="range" min={0} max={100} step={0.5}
                        value={oklch.l}
                        onChange={e => set('l', parseFloat(e.target.value))}
                        className="flex-1 h-1 accent-foreground cursor-pointer"
                    />
                    <span className="text-[10px] text-muted-foreground/50 w-8 text-right tabular-nums">{oklch.l.toFixed(0)}%</span>
                </div>
                {/* Chroma */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground/50 w-3">C</span>
                    <input
                        type="range" min={0} max={0.4} step={0.005}
                        value={oklch.c}
                        onChange={e => set('c', parseFloat(e.target.value))}
                        className="flex-1 h-1 accent-foreground cursor-pointer"
                    />
                    <span className="text-[10px] text-muted-foreground/50 w-8 text-right tabular-nums">{oklch.c.toFixed(3)}</span>
                </div>
                {/* Hue */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground/50 w-3">H</span>
                    <input
                        type="range" min={0} max={360} step={1}
                        value={oklch.h}
                        onChange={e => set('h', parseFloat(e.target.value))}
                        className="flex-1 h-1 accent-foreground cursor-pointer"
                    />
                    <span className="text-[10px] text-muted-foreground/50 w-8 text-right tabular-nums">{Math.round(oklch.h)}°</span>
                </div>
            </div>
        </div>
    )
}

// ─── Atmosphere Creator ────────────────────────────────────────────────────────

export interface AtmosphereValue {
    moodPreset: string | null     // MoodKey | 'custom' | null
    customPalette: MoodPalette | null
}

export function AtmosphereCreator({
    initial,
    onChange,
}: {
    initial: AtmosphereValue
    onChange: (v: AtmosphereValue) => void
}) {
    const { setMood, setCustomPalette, effectiveMoods } = useAtmosphere()
    const moods = effectiveMoods ?? hardcodedMoods

    const initialBaseMood = initial.moodPreset && initial.moodPreset !== 'custom'
        ? (initial.moodPreset as MoodKey)
        : null

    const [baseMood, setBaseMood] = useState<MoodKey | null>(initialBaseMood)
    const [palette, setPalette] = useState<MoodPalette | null>(
        initial.customPalette ??
        (initialBaseMood ? moods[initialBaseMood]?.palette ?? null : null)
    )
    const [customizing, setCustomizing] = useState(initial.moodPreset === 'custom')

    const handleBaseMoodSelect = (key: MoodKey | null) => {
        setBaseMood(key)
        setCustomizing(false)
        if (key) {
            const preset = moods[key].palette
            setPalette(preset)
            setMood(key)
            onChange({ moodPreset: key, customPalette: null })
        } else {
            setPalette(null)
            setCustomPalette(null)
            onChange({ moodPreset: null, customPalette: null })
        }
    }

    const handlePaletteChange = (newPalette: MoodPalette) => {
        setPalette(newPalette)
        setCustomPalette(newPalette)
        onChange({ moodPreset: 'custom', customPalette: newPalette })
    }

    const handleOpenCustomize = () => {
        setCustomizing(true)
        if (palette) setCustomPalette(palette)
    }

    const handleCloseCustomize = () => {
        setCustomizing(false)
        if (baseMood) {
            setMood(baseMood)
            onChange({ moodPreset: baseMood, customPalette: null })
        }
    }

    const handleReset = () => {
        if (!baseMood) return
        const preset = moods[baseMood].palette
        setPalette(preset)
        setCustomPalette(preset)
        onChange({ moodPreset: 'custom', customPalette: preset })
    }

    return (
        <div className="space-y-3">
            <label className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                Atmosphere
            </label>

            {/* Preset picker */}
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => handleBaseMoodSelect(null)}
                    className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                        baseMood === null
                            ? 'border-foreground/40 text-foreground bg-foreground/10'
                            : 'border-foreground/10 text-muted-foreground hover:text-foreground hover:border-foreground/20'
                    )}
                >
                    None
                </button>
                {moodKeys.map((key) => {
                    const m = moods[key]
                    const isActive = baseMood === key && !customizing
                    const isCustomBase = baseMood === key && customizing
                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => handleBaseMoodSelect(key)}
                            className={cn(
                                'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                                isActive
                                    ? 'border-foreground/40 text-foreground bg-foreground/10'
                                    : isCustomBase
                                        ? 'border-foreground/20 text-foreground/70 bg-foreground/5'
                                        : 'border-foreground/10 text-muted-foreground hover:text-foreground hover:border-foreground/20'
                            )}
                        >
                            <span
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ background: m.palette.solarStops[0] }}
                            />
                            {m.name}
                            {isCustomBase && <span className="opacity-50">*</span>}
                        </button>
                    )
                })}
            </div>

            {/* Customize toggle */}
            {baseMood && !customizing && (
                <button
                    type="button"
                    onClick={handleOpenCustomize}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2 decoration-foreground/20"
                >
                    Customize…
                </button>
            )}

            {/* Custom palette editor */}
            {customizing && palette && (
                <div className="space-y-5 p-4 rounded-xl border border-foreground/10 bg-foreground/3">

                    {/* Gradient stops */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/50">
                            Gradient — top to bottom
                        </p>
                        {palette.solarStops.map((stop, i) => (
                            <StopEditor
                                key={i}
                                label={['Top', 'Upper mid', 'Lower mid', 'Bottom'][i]}
                                value={stop}
                                onChange={(val) => {
                                    const newStops = [...palette.solarStops] as MoodPalette['solarStops']
                                    newStops[i] = val
                                    handlePaletteChange({ ...palette, solarStops: newStops })
                                }}
                            />
                        ))}
                    </div>

                    {/* Orb + particle intensity */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/50">
                            Intensity
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground/60 w-16">Orbs</span>
                            <input
                                type="range" min={0} max={0.6} step={0.01}
                                value={palette.orbOpacity}
                                onChange={e => handlePaletteChange({ ...palette, orbOpacity: parseFloat(e.target.value) })}
                                className="flex-1 h-1 accent-foreground cursor-pointer"
                            />
                            <span className="text-[10px] text-muted-foreground/50 w-8 text-right tabular-nums">{palette.orbOpacity.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground/60 w-16">Particles</span>
                            <input
                                type="range" min={0} max={0.5} step={0.01}
                                value={palette.particleOpacity}
                                onChange={e => handlePaletteChange({ ...palette, particleOpacity: parseFloat(e.target.value) })}
                                className="flex-1 h-1 accent-foreground cursor-pointer"
                            />
                            <span className="text-[10px] text-muted-foreground/50 w-8 text-right tabular-nums">{palette.particleOpacity.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-1 border-t border-foreground/8">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Reset to {baseMood ? moods[baseMood].name : 'preset'}
                        </button>
                        <span className="text-foreground/20">·</span>
                        <button
                            type="button"
                            onClick={handleCloseCustomize}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Use preset as-is
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
