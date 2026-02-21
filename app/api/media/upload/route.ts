
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// Allowed MIME types — server-side allowlist (not just client-side dropzone)
// ---------------------------------------------------------------------------
const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
    'application/pdf',
    'text/markdown',
    'text/x-markdown',
    'text/plain',
])

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB

// ---------------------------------------------------------------------------
// Simple per-process rate limiter: 30 uploads per IP per minute
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 30
const RATE_LIMIT_WINDOW_MS = 60_000

function checkRateLimit(ip: string): boolean {
    const now = Date.now()
    const entry = rateLimitMap.get(ip)

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
        return true
    }

    if (entry.count >= RATE_LIMIT_MAX) return false

    entry.count++
    return true
}

export async function POST(request: Request) {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    if (!checkRateLimit(ip)) {
        return NextResponse.json({ error: 'Too many uploads. Try again shortly.' }, { status: 429 })
    }

    try {
        const supabase = await createServerClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null
        const moduleSlug = formData.get('module_slug') as string | null
        const contentId = formData.get('content_id') as string | null
        const classification = formData.get('classification') as string || 'both'
        const textContent = formData.get('text_content') as string | null
        const title = formData.get('title') as string | null

        // Server-side file validation
        if (file) {
            if (!ALLOWED_MIME_TYPES.has(file.type)) {
                return NextResponse.json(
                    { error: `File type "${file.type}" is not allowed.` },
                    { status: 400 }
                )
            }
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    { error: `File exceeds the 20 MB limit.` },
                    { status: 400 }
                )
            }
        }

        // Infer bucket from moduleSlug if possible, otherwise default to photography
        let bucket = formData.get('bucket') as string || 'photography'

        if (moduleSlug) {
            if (['projects', 'architecture', 'software-pro', 'software-personal', 'creative'].includes(moduleSlug)) {
                bucket = 'projects'
            } else if (moduleSlug === 'photography') {
                bucket = 'photography'
            }
        }

        // Restrict bucket to known values
        if (bucket !== 'photography' && bucket !== 'projects') {
            bucket = 'photography'
        }

        let filePath = ''
        let publicUrl: string | null = null

        if (file) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            filePath = `${fileName}`

            // 1. Upload to Storage
            const { error: storageError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file)

            if (storageError) {
                console.error('Storage Upload Error:', storageError)
                return NextResponse.json({ error: storageError.message }, { status: 500 })
            }

            // 2. Get Public URL
            const { data: urlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath)

            publicUrl = urlData.publicUrl
        }

        // 3. Insert into Database
        const moduleTags = moduleSlug ? [moduleSlug] : []

        const mediaData = {
            file_url: publicUrl,
            file_type: file ? (file.type.startsWith('image/') ? 'image' :
                file.type === 'application/pdf' ? 'pdf' :
                    file.name.endsWith('.md') || file.name.endsWith('.mdx') || file.type.startsWith('text/') ? 'text' : 'video') : 'text',
            filename: file?.name || (title ? `${title}.md` : 'thought.md'),
            file_size: file?.size || 0,
            sort_order: 0,
            metadata: {},
            content_id: contentId || null,
            bucket,
            module_slug: moduleSlug || undefined,
            module_tags: moduleTags,
            classification,
            text_content: textContent,
            title
        }

        const { data: dbData, error: dbError } = await supabase
            .from('media')
            .insert(mediaData)
            .select()
            .single()

        if (dbError) {
            console.error('Database insertion error:', dbError)
            // Cleanup storage if DB fails
            if (filePath) {
                await supabase.storage.from(bucket).remove([filePath])
            }
            return NextResponse.json({ error: dbError.message }, { status: 500 })
        }

        return NextResponse.json({ media: dbData })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
