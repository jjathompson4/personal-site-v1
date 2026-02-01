'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState, useRef } from 'react'

export function SolarGradient({ children }: { children: React.ReactNode }) {
    const { theme, systemTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Raw input values
    const targetMousePos = useRef({ x: 0, y: 0 })
    const targetScrollOffset = useRef(0)

    // Smoothly interpolated values
    const [displayMousePos, setDisplayMousePos] = useState({ x: 0, y: 0 })
    const [displayScrollOffset, setDisplayScrollOffset] = useState(0)

    // For lerping
    const currentMousePos = useRef({ x: 0, y: 0 })
    const currentScrollOffset = useRef(0)

    useEffect(() => {
        setMounted(true)

        const handleScroll = () => {
            const scrollY = window.scrollY
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight
            const scrollPercent = maxScroll > 0 ? scrollY / maxScroll : 0
            targetScrollOffset.current = scrollPercent
        }

        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth) * 2 - 1
            const y = (e.clientY / window.innerHeight) * 2 - 1
            targetMousePos.current = { x, y }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        window.addEventListener('mousemove', handleMouseMove, { passive: true })

        // Smooth interpolation loop
        let animationFrameId: number
        const render = () => {
            // Lerp factor (higher = faster response)
            const lerpFactor = 0.08

            currentMousePos.current.x += (targetMousePos.current.x - currentMousePos.current.x) * lerpFactor
            currentMousePos.current.y += (targetMousePos.current.y - currentMousePos.current.y) * lerpFactor
            currentScrollOffset.current += (targetScrollOffset.current - currentScrollOffset.current) * lerpFactor

            setDisplayMousePos({ ...currentMousePos.current })
            setDisplayScrollOffset(currentScrollOffset.current)

            animationFrameId = requestAnimationFrame(render)
        }

        animationFrameId = requestAnimationFrame(render)

        return () => {
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('mousemove', handleMouseMove)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    if (!mounted) {
        return <>{children}</>
    }

    const horizonShift = displayScrollOffset * 8

    return (
        <div className="flex-1 flex flex-col relative h-full w-full isolate">
            <div className="fixed inset-0 z-0 w-full h-full pointer-events-none">
                {/* Layer 0: Base Solar Gradient */}
                <div
                    className="absolute inset-0 solar-gradient-bg transition-opacity"
                    style={{
                        '--solar-pos-2': `${50 - horizonShift / 2}%`,
                        '--solar-pos-3': `${95 - horizonShift}%`,
                    } as React.CSSProperties}
                />

                {/* Layer 1: Vibrant Mesh (Visible only at edges via Mask) */}
                <div
                    className="absolute inset-0 overflow-hidden"
                    style={{
                        maskImage: 'radial-gradient(circle at center, transparent 10%, black 100%)',
                        WebkitMaskImage: 'radial-gradient(circle at center, transparent 10%, black 100%)'
                    }}
                >
                    {/* Top Left - Deep Depth (Lagging more) */}
                    <div
                        className="absolute top-[-20%] left-[-20%] w-[100vw] h-[100vw] rounded-full blur-[100px] ease-out will-change-transform"
                        style={{
                            opacity: 'var(--orb-opacity)',
                            background: 'radial-gradient(circle at center, var(--orb-1) 0%, var(--orb-3) 60%, transparent 70%)',
                            transform: `translate(${displayMousePos.x * -600}px, ${displayMousePos.y * -600}px)`
                        }}
                    />

                    {/* Bottom Right - Medium Depth */}
                    <div
                        className="absolute bottom-[-20%] right-[-20%] w-[100vw] h-[100vw] rounded-full blur-[100px] ease-out will-change-transform"
                        style={{
                            opacity: 'var(--orb-opacity)',
                            background: 'radial-gradient(circle at center, var(--orb-2) 0%, var(--orb-1) 60%, transparent 70%)',
                            transform: `translate(${displayMousePos.x * 400}px, ${displayMousePos.y * 400}px)`
                        }}
                    />

                    {/* Top Right - Foreground (Faster) */}
                    <div
                        className="absolute top-[-30%] right-[-10%] w-[90vw] h-[90vw] rounded-full blur-[100px] ease-out will-change-transform"
                        style={{
                            opacity: 'var(--orb-opacity)',
                            background: 'radial-gradient(circle at center, var(--orb-4) 0%, var(--orb-3) 70%, transparent 70%)',
                            transform: `translate(${displayMousePos.x * 250}px, ${displayMousePos.y * -250}px)`
                        }}
                    />

                    {/* Bottom Left - Atmospheric Depth */}
                    <div
                        className="absolute bottom-[-10%] left-[-10%] w-[80vw] h-[80vw] rounded-full blur-[120px] ease-out will-change-transform"
                        style={{
                            opacity: 'calc(var(--orb-opacity) * 0.6)',
                            background: 'radial-gradient(circle at center, var(--orb-1) 0%, var(--orb-2) 60%, transparent 70%)',
                            transform: `translate(${displayMousePos.x * -150}px, ${displayMousePos.y * 150}px)`
                        }}
                    />

                    {/* Center Accent - Static/Floaty */}
                    <div
                        className="absolute top-[-35%] left-[30%] w-[60vw] h-[60vw] rounded-full blur-[120px] ease-out will-change-transform"
                        style={{
                            opacity: 'calc(var(--orb-opacity) * 0.5)',
                            background: 'radial-gradient(circle at center, var(--orb-3) 0%, transparent 60%)',
                            transform: `translate(${displayMousePos.x * 100}px, ${displayMousePos.y * 450}px)`
                        }}
                    />
                </div>

                {/* Noise Overlay */}
                <div className="absolute inset-0 bg-noise opacity-[0.07]" />
            </div>

            {/* Content Container */}
            <div className="flex-1 flex flex-col relative z-10">
                {children}
            </div>
        </div>
    )
}
