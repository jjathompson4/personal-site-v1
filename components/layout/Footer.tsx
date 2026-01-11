import Link from 'next/link'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'
import { AdminLink } from './AdminLink'

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer
            className="border-t backdrop-blur supports-[backdrop-filter]:bg-background/60"
            style={{
                backgroundColor: 'var(--glass-bg)',
                borderColor: 'var(--glass-border)'
            }}
        >
            <div className="w-full max-w-screen-xl mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* About */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold">About</h3>
                        <p className="text-sm text-muted-foreground">
                            Personal website and portfolio showcasing my work and thoughts.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold pl-3">Explore</h3>
                        <ul className="space-y-0">
                            <li>
                                <Link href="/photography" className="block w-fit text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all rounded-md px-3 py-2">
                                    Photography
                                </Link>
                            </li>
                            <li>
                                <Link href="/projects" className="block w-fit text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all rounded-md px-3 py-2">
                                    Projects
                                </Link>
                            </li>
                            <li>
                                <Link href="/resume" className="block w-fit text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all rounded-md px-3 py-2">
                                    Resume
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Writing */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold pl-3">Writing</h3>
                        <ul className="space-y-0">
                            <li>
                                <Link href="/ideas" className="block w-fit text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all rounded-md px-3 py-2">
                                    Personal Ideas
                                </Link>
                            </li>
                            <li>
                                <Link href="/aec" className="block w-fit text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all rounded-md px-3 py-2">
                                    Thoughts on AEC
                                </Link>
                            </li>
                            <li>
                                <Link href="/wip" className="block w-fit text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all rounded-md px-3 py-2">
                                    Work in Progress
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold pl-2">Connect</h3>
                        <div className="flex gap-2">
                            <a
                                href="https://github.com/yourusername"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all rounded-md p-2"
                            >
                                <Github className="h-5 w-5" />
                                <span className="sr-only">GitHub</span>
                            </a>
                            <a
                                href="https://twitter.com/yourusername"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all rounded-md p-2"
                            >
                                <Twitter className="h-5 w-5" />
                                <span className="sr-only">Twitter</span>
                            </a>
                            <a
                                href="https://linkedin.com/in/yourusername"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all rounded-md p-2"
                            >
                                <Linkedin className="h-5 w-5" />
                                <span className="sr-only">LinkedIn</span>
                            </a>
                            <a
                                href="mailto:you@example.com"
                                className="flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all rounded-md p-2"
                            >
                                <Mail className="h-5 w-5" />
                                <span className="sr-only">Email</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t pt-8">
                    <p className="text-center text-sm text-muted-foreground">
                        © {currentYear} Jeff Thompson. All rights reserved.
                    </p>
                    <div className="flex justify-center mt-4">
                        <AdminLink />
                    </div>
                </div>
            </div>
        </footer>
    )
}
