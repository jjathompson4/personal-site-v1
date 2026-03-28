'use client'

import { useEffect, useRef, useCallback } from 'react'

interface ParticleCanvasProps {
  color: string
  opacity: number
  isMobile: boolean
  reducedMotion: boolean
}

interface Particle {
  x: number
  y: number
  size: number
  vx: number
  vy: number
  baseOpacity: number
  flickerPhase: number
  flickerSpeed: number
  wobblePhase: number
  wobbleAmp: number
  isBright: boolean
  /** Index into the pre-rendered sprite array (for large particles) */
  spriteIndex: number
}

/**
 * Canvas 2D particle system — dust motes floating in sunlight.
 *
 * Performance optimizations:
 * - Throttled to ~30fps (ambient effect doesn't need 60fps)
 * - Large particles use pre-rendered sprites (offscreen canvas)
 *   instead of creating radial gradients every frame
 * - Pauses when tab is hidden
 * - Skips fully transparent particles
 */
export function ParticleCanvas({ color, opacity, isMobile, reducedMotion }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)
  const timeRef = useRef(0)
  const spritesRef = useRef<HTMLCanvasElement[]>([])

  const particleCount = isMobile ? 20 : 50
  const FRAME_INTERVAL = 33 // ~30fps

  const parseColor = useCallback((cssColor: string): string => {
    if (typeof document === 'undefined') return 'rgb(200, 200, 200)'
    const div = document.createElement('div')
    div.style.color = cssColor
    document.body.appendChild(div)
    const computed = getComputedStyle(div).color
    document.body.removeChild(div)
    return computed
  }, [])

  /** Pre-render soft circle sprites at a few sizes for large particles */
  const buildSprites = useCallback((r: number, g: number, b: number) => {
    const sizes = [2, 3, 4, 5] // px radii
    const sprites: HTMLCanvasElement[] = []

    for (const size of sizes) {
      const s = Math.ceil(size * 2 + 2)
      const c = document.createElement('canvas')
      c.width = s * 2 // account for DPR
      c.height = s * 2
      const ctx = c.getContext('2d')!
      const cx = s
      const cy = s
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size)
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`)
      grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.4)`)
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(cx, cy, size, 0, Math.PI * 2)
      ctx.fill()
      sprites.push(c)
    }

    spritesRef.current = sprites
  }, [])

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      const isLarge = Math.random() < 0.15
      const isBright = !isLarge && Math.random() < 0.1

      const size = isLarge
        ? 2 + Math.random() * 2.5
        : 0.4 + Math.random() * 1.4

      const baseOpacity = isLarge
        ? 0.12 + Math.random() * 0.15
        : isBright
          ? 0.5 + Math.random() * 0.35
          : 0.15 + Math.random() * 0.25

      // Map large particle size to sprite index
      const spriteIndex = isLarge ? Math.min(Math.floor(size - 2), 3) : -1

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -0.02 - Math.random() * 0.08,
        baseOpacity,
        flickerPhase: Math.random() * Math.PI * 2,
        flickerSpeed: 0.0005 + Math.random() * 0.002,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleAmp: 0.05 + Math.random() * 0.15,
        isBright,
        spriteIndex,
      })
    }
    particlesRef.current = particles
  }, [particleCount])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let lastFrame = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initParticles(window.innerWidth, window.innerHeight)
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })

    const rgbaColor = parseColor(color)
    const match = rgbaColor.match(/(\d+),\s*(\d+),\s*(\d+)/)
    const r = match ? parseInt(match[1]) : 200
    const g = match ? parseInt(match[2]) : 200
    const b = match ? parseInt(match[3]) : 200

    buildSprites(r, g, b)

    const draw = (now: number) => {
      const w = window.innerWidth
      const h = window.innerHeight
      const t = timeRef.current

      ctx.clearRect(0, 0, w, h)

      for (const p of particlesRef.current) {
        if (!reducedMotion) {
          const wobbleX = Math.sin(t * 0.0007 + p.wobblePhase) * p.wobbleAmp
          const wobbleY = Math.cos(t * 0.0005 + p.wobblePhase * 1.3) * p.wobbleAmp * 0.7

          p.x += p.vx + wobbleX
          p.y += p.vy + wobbleY

          if (p.x < -20) p.x = w + 20
          if (p.x > w + 20) p.x = -20
          if (p.y < -20) p.y = h + 20
          if (p.y > h + 20) p.y = -20
        }

        const flicker = 0.5 + 0.5 * Math.sin(t * p.flickerSpeed + p.flickerPhase)
        const flickerMod = p.isBright ? 0.3 + flicker * 0.7 : 0.6 + flicker * 0.4
        const alpha = p.baseOpacity * flickerMod * opacity

        if (alpha < 0.01) continue

        // Large particles: use pre-rendered sprite
        if (p.spriteIndex >= 0 && spritesRef.current[p.spriteIndex]) {
          const sprite = spritesRef.current[p.spriteIndex]
          const sw = sprite.width / 2 // account for sprite DPR
          ctx.globalAlpha = alpha
          ctx.drawImage(sprite, p.x - sw / 2, p.y - sw / 2, sw, sw)
          ctx.globalAlpha = 1
        } else {
          // Tiny specks: simple arc (cheap)
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
          ctx.fill()
        }
      }

      timeRef.current += FRAME_INTERVAL
    }

    if (reducedMotion) {
      draw(0)
      return () => window.removeEventListener('resize', resize)
    }

    const animate = (now: number) => {
      rafRef.current = requestAnimationFrame(animate)

      // Throttle to ~30fps
      if (now - lastFrame < FRAME_INTERVAL) return
      lastFrame = now

      // Skip when tab is hidden
      if (document.hidden) return

      draw(now)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [color, opacity, reducedMotion, initParticles, parseColor, buildSprites])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}
