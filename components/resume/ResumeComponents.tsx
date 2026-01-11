
import { cn } from '@/lib/utils'

interface ResumeSectionProps {
    title: string
    children: React.ReactNode
    className?: string
}

export function ResumeSection({ title, children, className }: ResumeSectionProps) {
    return (
        <section className={cn("space-y-6", className)}>
            <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold uppercase tracking-widest text-primary/80">{title}</h3>
                <div className="h-px bg-border flex-1" />
            </div>
            <div className="space-y-8">
                {children}
            </div>
        </section>
    )
}

interface ResumeItemProps {
    role: string
    company: string
    period: string
    location?: string
    description?: string
    achievements?: string[]
}

export function ResumeItem({ role, company, period, location, description, achievements }: ResumeItemProps) {
    return (
        <div className="space-y-2 break-inside-avoid">
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1">
                <h4 className="text-lg font-semibold">{role}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                    <span>{period}</span>
                    {location && (
                        <>
                            <span>•</span>
                            <span>{location}</span>
                        </>
                    )}
                </div>
            </div>
            <p className="text-base font-medium text-primary">{company}</p>

            {description && (
                <p className="text-muted-foreground leading-relaxed max-w-3xl">
                    {description}
                </p>
            )}

            {achievements && (
                <ul className="list-disc list-outside ml-4 space-y-1 text-muted-foreground">
                    {achievements.map((item, i) => (
                        <li key={i}>{item}</li>
                    ))}
                </ul>
            )}
        </div>
    )
}
