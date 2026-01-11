'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function SolarGradient({ children }: { children: React.ReactNode }) {
    const { theme, systemTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    const [scrollOffset, setScrollOffset] = useState(0)

    useEffect(() => {
        setMounted(true)

        const handleScroll = () => {
            const scrollY = window.scrollY
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight
            const scrollPercent = maxScroll > 0 ? scrollY / maxScroll : 0
            setScrollOffset(scrollPercent)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    if (!mounted) {
        return <>{children}</>
    }

    // Higher value = more parallax shift
    const horizonShift = scrollOffset * 8

    return (
        <div
            className="flex-1 flex flex-col solar-gradient-bg"
            style={{
                // Passing parallax positions as variables to keep the main background CSS static
                // This ensures the Houdini color transitions are not interrupted
                '--solar-pos-2': `${50 - horizonShift / 2}%`,
                '--solar-pos-3': `${95 - horizonShift}%`,
            } as React.CSSProperties}
        >
            {children}
        </div>
    )
}
