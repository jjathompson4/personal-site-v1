'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState, useRef } from 'react'

export function SolarGradient({ children }: { children: React.ReactNode }) {
    useTheme()
    const [isMobile, setIsMobile] = useState(false)

    // Raw input values
    const targetMousePos = useRef({ x: 0, y: 0 })
    const targetScrollOffset = useRef(0)

    // Current lerped values
    const currentMousePos = useRef({ x: 0, y: 0 })
    const currentScrollOffset = useRef(0)

    // DOM Refs for direct style manipulation
    const bgContainerRef = useRef<HTMLDivElement>(null)
    const orb1Ref = useRef<HTMLDivElement>(null)
    const orb2Ref = useRef<HTMLDivElement>(null)
    const orb3Ref = useRef<HTMLDivElement>(null)
    const orb4Ref = useRef<HTMLDivElement>(null)
    const orb5Ref = useRef<HTMLDivElement>(null)
    const solarBgRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Simple mobile check based on window width
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkMobile()
        window.addEventListener('resize', checkMobile, { passive: true })

        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => {
        // Skip animation loop on mobile or if user prefers reduced motion
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        const isReducedMotion = mediaQuery.matches

        if (isMobile || isReducedMotion) {
            return
        }

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

        let animationFrameId: number
        let isRunning = true

        const render = () => {
            if (!isRunning) return

            const lerpFactor = 0.08

            // Interpolate
            currentMousePos.current.x += (targetMousePos.current.x - currentMousePos.current.x) * lerpFactor
            currentMousePos.current.y += (targetMousePos.current.y - currentMousePos.current.y) * lerpFactor
            currentScrollOffset.current += (targetScrollOffset.current - currentScrollOffset.current) * lerpFactor

            const x = currentMousePos.current.x
            const y = currentMousePos.current.y
            const scroll = currentScrollOffset.current
            const horizonShift = scroll * 8

            // 1. Update Base Solar Gradient Positions
            if (solarBgRef.current) {
                solarBgRef.current.style.setProperty('--solar-pos-2', `${50 - horizonShift / 2}%`)
                solarBgRef.current.style.setProperty('--solar-pos-3', `${95 - horizonShift}%`)
            }

            // 2. Update Orbs (using direct transform)
            if (orb1Ref.current) orb1Ref.current.style.transform = `translate(${x * -600}px, ${y * -600}px)`
            if (orb2Ref.current) orb2Ref.current.style.transform = `translate(${x * 400}px, ${y * 400}px)`
            if (orb3Ref.current) orb3Ref.current.style.transform = `translate(${x * 250}px, ${y * -250}px)`
            if (orb4Ref.current) orb4Ref.current.style.transform = `translate(${x * -150}px, ${y * 150}px)`
            if (orb5Ref.current) orb5Ref.current.style.transform = `translate(${x * 100}px, ${y * 450}px)`

            animationFrameId = requestAnimationFrame(render)
        }

        animationFrameId = requestAnimationFrame(render)

        return () => {
            isRunning = false
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('mousemove', handleMouseMove)
            cancelAnimationFrame(animationFrameId)
        }
    }, [isMobile])

    return (
        <div className="flex-1 flex flex-col relative h-full w-full isolate">
            <div className="fixed inset-0 z-0 w-full h-full pointer-events-none" ref={bgContainerRef}>
                {/* Layer 0: Base Solar Gradient */}
                <div
                    ref={solarBgRef}
                    className="absolute inset-0 solar-gradient-bg transition-opacity"
                    style={{
                        '--solar-pos-2': '50%',
                        '--solar-pos-3': '95%',
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
                    {/* Top Left - Deep Depth */}
                    <div
                        ref={orb1Ref}
                        className="absolute top-[-20%] left-[-20%] w-[100vw] h-[100vw] rounded-full blur-[100px] will-change-transform"
                        style={{
                            opacity: 'var(--orb-opacity)',
                            background: 'radial-gradient(circle at center, var(--orb-1) 0%, var(--orb-3) 60%, transparent 70%)',
                        }}
                    />

                    {/* Bottom Right - Medium Depth */}
                    <div
                        ref={orb2Ref}
                        className="absolute bottom-[-20%] right-[-20%] w-[100vw] h-[100vw] rounded-full blur-[100px] will-change-transform"
                        style={{
                            opacity: 'var(--orb-opacity)',
                            background: 'radial-gradient(circle at center, var(--orb-2) 0%, var(--orb-1) 60%, transparent 70%)',
                        }}
                    />

                    {/* Top Right - Foreground */}
                    <div
                        ref={orb3Ref}
                        className="absolute top-[-30%] right-[-10%] w-[90vw] h-[90vw] rounded-full blur-[100px] will-change-transform"
                        style={{
                            opacity: 'var(--orb-opacity)',
                            background: 'radial-gradient(circle at center, var(--orb-4) 0%, var(--orb-3) 70%, transparent 70%)',
                        }}
                    />

                    {/* Bottom Left - Atmospheric Depth - Hidden on mobile */}
                    <div
                        ref={orb4Ref}
                        className="hidden md:block absolute bottom-[-10%] left-[-10%] w-[80vw] h-[80vw] rounded-full blur-[120px] will-change-transform"
                        style={{
                            opacity: 'calc(var(--orb-opacity) * 0.6)',
                            background: 'radial-gradient(circle at center, var(--orb-1) 0%, var(--orb-2) 60%, transparent 70%)',
                        }}
                    />

                    {/* Center Accent - Static/Floaty - Hidden on mobile */}
                    <div
                        ref={orb5Ref}
                        className="hidden md:block absolute top-[-35%] left-[30%] w-[60vw] h-[60vw] rounded-full blur-[120px] will-change-transform"
                        style={{
                            opacity: 'calc(var(--orb-opacity) * 0.5)',
                            background: 'radial-gradient(circle at center, var(--orb-3) 0%, transparent 60%)',
                        }}
                    />
                </div>

                {/* Noise Overlay */}
                <div className="absolute inset-0 bg-noise opacity-[0.05]" />
            </div>

            {/* Content Container */}
            <div className="flex-1 flex flex-col relative z-10">
                {children}
            </div>
        </div>
    )
}
