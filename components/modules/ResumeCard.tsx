'use client'

import { FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function ResumeCard() {
    return (
        <div className="relative overflow-hidden rounded-3xl border bg-background/40 backdrop-blur-sm border-primary/10 p-8 md:p-12 text-center space-y-6 group transition-all hover:bg-background/60 hover:border-primary/20">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform">
                <FileText className="h-8 w-8" />
            </div>

            <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight">Professional Resume</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                    A comprehensive overview of my experience in Lighting Design, Software Engineering, and Creative Production.
                </p>
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-4">
                <Button asChild variant="default" className="rounded-full px-8">
                    <Link href="/resume">
                        View Full Resume <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>

            {/* Subtle background decoration */}
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
        </div>
    )
}
