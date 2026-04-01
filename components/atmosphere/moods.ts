/**
 * Atmosphere mood presets — ordered by time-of-day progression.
 *
 * Each defines a single, definitive color palette that captures the mood's
 * essence regardless of the system dark/light toggle. The dark/light system
 * toggle only affects content chrome (text, cards, nav) for readability.
 *
 * Design principle: subliminal, not spectacular. "If someone asks 'does the
 * background move?' and they're not sure, you've nailed it."
 *
 * Colors use OKLCH for perceptually uniform transitions (matches the
 * existing Houdini @property registrations in globals.css).
 */

export interface MoodPalette {
  /** 4 gradient stops, top to bottom */
  solarStops: [string, string, string, string]
  /** 4 orb colors for the parallax mesh */
  orbs: [string, string, string, string]
  /** Orb opacity multiplier */
  orbOpacity: number
  /** Particle (dust mote) color */
  particleColor: string
  /** Particle opacity multiplier */
  particleOpacity: number
}

export interface MoodPreset {
  name: string
  description: string
  /** The definitive palette — this IS the mood's light quality */
  palette: MoodPalette
  /**
   * Whether content chrome should default to light or dark text.
   * Bright moods (morning, overcast) suggest dark text on light glass.
   * Dark moods (dusk, twilight) suggest light text on dark glass.
   */
  chromeHint: 'light' | 'dark'
}

export const moods: Record<string, MoodPreset> = {
  // 1. Early morning
  sunrise: {
    name: 'Sunrise',
    description: 'First light breaking — soft pink and lavender pre-dawn',
    chromeHint: 'light',
    palette: {
      solarStops: [
        'oklch(82% 0.05 280)',  // soft lavender top (pre-dawn)
        'oklch(80% 0.07 310)',  // pink-mauve mid
        'oklch(82% 0.10 20)',   // warm rose horizon
        'oklch(85% 0.08 50)',   // pale apricot bottom
      ],
      orbs: [
        'oklch(82% 0.10 330)', // pink glow
        'oklch(78% 0.08 280)', // lavender depth
        'oklch(86% 0.08 20)',  // rose accent
        'oklch(80% 0.06 50)',  // warm apricot
      ],
      orbOpacity: 0.3,
      particleColor: 'oklch(85% 0.05 330)',
      particleOpacity: 0.2,
    },
  },

  // 2. Mid-morning
  'morning-clarity': {
    name: 'Morning Clarity',
    description: 'Cool blue-shift — focused, crisp',
    chromeHint: 'light',
    palette: {
      solarStops: [
        'oklch(92% 0.04 225)',  // definite sky blue top
        'oklch(90% 0.05 235)',  // mid blue
        'oklch(88% 0.04 240)',  // deeper blue
        'oklch(91% 0.03 215)',  // pale blue horizon
      ],
      orbs: [
        'oklch(88% 0.08 230)', // clear sky blue
        'oklch(84% 0.10 250)', // deeper blue
        'oklch(90% 0.06 220)', // pale atmosphere
        'oklch(86% 0.07 210)', // steel blue
      ],
      orbOpacity: 0.3,
      particleColor: 'oklch(90% 0.04 230)',
      particleOpacity: 0.2,
    },
  },

  // 3. Midday (any weather)
  overcast: {
    name: 'Overcast',
    description: 'Grey sky, wet streets — grounded, urban',
    chromeHint: 'dark',
    palette: {
      solarStops: [
        'oklch(55% 0.006 240)', // grey sky top
        'oklch(48% 0.008 230)', // heavier cloud
        'oklch(40% 0.006 220)', // dark overcast
        'oklch(35% 0.005 210)', // wet asphalt bottom
      ],
      orbs: [
        'oklch(45% 0.02 230)', // cool grey
        'oklch(40% 0.02 220)', // dark grey
        'oklch(50% 0.01 240)', // lighter grey break
        'oklch(38% 0.03 210)', // charcoal
      ],
      orbOpacity: 0.2,
      particleColor: 'oklch(55% 0.01 240)',
      particleOpacity: 0.1,
    },
  },

  // 4. Late afternoon
  'golden-hour': {
    name: 'Golden Hour',
    description: 'Late afternoon — rich gold flooding everything',
    chromeHint: 'light',
    palette: {
      solarStops: [
        'oklch(90% 0.06 80)',   // warm pale gold top
        'oklch(86% 0.10 65)',   // rich gold mid
        'oklch(82% 0.12 55)',   // deep gold lower
        'oklch(80% 0.10 45)',   // amber bottom
      ],
      orbs: [
        'oklch(86% 0.14 60)',   // dominant warm gold
        'oklch(82% 0.10 50)',   // deeper gold
        'oklch(90% 0.08 75)',   // bright honey accent
        'oklch(84% 0.12 40)',   // amber glow
      ],
      orbOpacity: 0.35,
      particleColor: 'oklch(90% 0.06 60)',
      particleOpacity: 0.25,
    },
  },

  // 5. Evening
  sunset: {
    name: 'Sunset',
    description: 'Deep horizon gradient — rich reds fading to indigo sky',
    chromeHint: 'dark',
    palette: {
      solarStops: [
        'oklch(25% 0.04 260)',  // deep indigo upper sky
        'oklch(32% 0.08 320)',  // magenta-purple mid
        'oklch(45% 0.14 15)',   // deep red-orange horizon
        'oklch(40% 0.12 30)',   // burnt amber bottom
      ],
      orbs: [
        'oklch(40% 0.16 15)',   // deep red glow
        'oklch(28% 0.10 280)',  // indigo depth
        'oklch(48% 0.12 340)',  // magenta accent
        'oklch(42% 0.10 40)',   // warm amber
      ],
      orbOpacity: 0.35,
      particleColor: 'oklch(50% 0.06 20)',
      particleOpacity: 0.18,
    },
  },

  // 6. Dusk — artificial light mixing with fading sky
  'hps-at-dusk': {
    name: 'HPS at Dusk',
    description: 'Warm artificial light meets fading sky — dreamlike, the original v1 vibe',
    chromeHint: 'dark',
    palette: {
      solarStops: [
        'oklch(20% 0.02 250)',  // deep blue-grey sky
        'oklch(24% 0.04 240)',  // twilight mid
        'oklch(30% 0.06 40)',   // warm horizon glow
        'oklch(35% 0.08 35)',   // sodium warm bottom
      ],
      orbs: [
        'oklch(35% 0.16 40)',   // warm sodium glow
        'oklch(30% 0.14 240)',  // cool contrast
        'oklch(32% 0.12 300)',  // deep magenta accent
        'oklch(42% 0.18 80)',   // amber streetlight
      ],
      orbOpacity: 0.4,
      particleColor: 'oklch(55% 0.06 50)',
      particleOpacity: 0.18,
    },
  },

  // 7. Night
  'flashlight-tag': {
    name: 'Flashlight Tag',
    description: 'Deep night — warm light cutting through darkness',
    chromeHint: 'dark',
    palette: {
      solarStops: [
        'oklch(10% 0.01 250)',  // near-black top
        'oklch(12% 0.015 240)', // deep navy
        'oklch(11% 0.01 230)',  // dark navy
        'oklch(10% 0.008 220)', // near-black bottom
      ],
      orbs: [
        'oklch(45% 0.14 55)',  // warm flashlight beam
        'oklch(35% 0.10 45)',  // secondary warm glow
        'oklch(15% 0.02 240)', // barely-there cool fill
        'oklch(14% 0.01 250)', // near-invisible
      ],
      orbOpacity: 0.5,
      particleColor: 'oklch(50% 0.06 55)',
      particleOpacity: 0.12,
    },
  },

  // 8. Late night
  twilight: {
    name: 'Twilight',
    description: 'Deep blue-purple transition — liminal, in-between',
    chromeHint: 'dark',
    palette: {
      solarStops: [
        'oklch(24% 0.04 280)',  // deep violet top
        'oklch(22% 0.05 290)',  // purple mid
        'oklch(20% 0.06 300)',  // deeper purple
        'oklch(19% 0.04 320)',  // dark rose bottom
      ],
      orbs: [
        'oklch(26% 0.10 280)', // violet
        'oklch(24% 0.10 300)', // magenta
        'oklch(30% 0.06 260)', // pale purple
        'oklch(28% 0.08 320)', // rose
      ],
      orbOpacity: 0.3,
      particleColor: 'oklch(45% 0.05 290)',
      particleOpacity: 0.15,
    },
  },
}

/** Narrow union of the 8 built-in mood keys */
export type BuiltinMoodKey = keyof typeof moods

/** Runtime mood key — can be built-in or a custom preset slug */
export type MoodKey = string

/** Only the 8 hardcoded keys */
export const builtinMoodKeys = Object.keys(moods) as BuiltinMoodKey[]

/** @deprecated Use builtinMoodKeys — kept for backward compat */
export const moodKeys = builtinMoodKeys

export const defaultMood: BuiltinMoodKey = 'hps-at-dusk'
