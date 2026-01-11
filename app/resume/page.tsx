import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SolarGradient } from '@/components/layout/SolarGradient'
import { FileText } from 'lucide-react'

export const metadata = {
    title: 'Resume | Jeff Thompson',
    description: 'Resume and CV.',
}

export default function ResumePage() {
    return (
        <SolarGradient>
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 pt-8 pb-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                        {/* Header */}
                        <div className="space-y-6 text-center max-w-2xl mx-auto">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Resume</h1>
                            <p className="text-xl text-muted-foreground">
                                Professional experience and background.
                            </p>
                        </div>

                        <div className="py-24 text-center border rounded-2xl bg-background/50 border-dashed max-w-2xl mx-auto">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                            <h3 className="text-lg font-semibold">Coming Soon</h3>
                            <p className="text-muted-foreground">This section is currently being updated.</p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </SolarGradient>
    )
}
