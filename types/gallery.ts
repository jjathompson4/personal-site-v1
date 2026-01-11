
import { Media } from './media'

export interface Gallery {
    id: string
    name: string
    slug: string
    description?: string
    cover_image_id?: string
    visibility: 'owner' | 'password' | 'public'
    password_hash?: string
    share_token?: string
    sort_order: number
    created_at: string
    updated_at: string
    // content joined
    cover_image?: Media
    media?: Media[] // via gallery_media
}

export interface GalleryMedia {
    gallery_id: string
    media_id: string
    sort_order: number
    media?: Media
}
