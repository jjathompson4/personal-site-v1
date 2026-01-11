import { describe, it, expect } from 'vitest'
import { buildStream } from '@/lib/stream'
import { Media } from '@/types/media'

const mockMedia = (
    id: string,
    type: 'image' | 'text',
    sort_order = 0
): Media => ({
    id,
    type: type, // This seems to be missing in your Media type definition in favor of file_type, but I'll use file_type below
    file_type: type,
    file_url: 'http://example.com/' + id,
    filename: id,
    file_size: 100,
    sort_order,
    metadata: {},
    created_at: new Date().toISOString()
})

describe('buildStream', () => {
    it('should return empty stream for empty input', () => {
        const result = buildStream([], new Map())
        expect(result).toEqual([])
    })

    it('should group consecutive images', () => {
        const media = [
            mockMedia('1', 'image'),
            mockMedia('2', 'image')
        ]
        const result = buildStream(media, new Map())

        expect(result).toHaveLength(1)
        expect(result[0].type).toBe('photos')
        if (result[0].type === 'photos') {
            expect(result[0].photos).toHaveLength(2)
            expect(result[0].photos[0].id).toBe('1')
        }
    })

    it('should separate images by text', () => {
        const media = [
            mockMedia('1', 'image'),
            mockMedia('text1', 'text'),
            mockMedia('2', 'image')
        ]
        const contents = new Map([['text1', 'Hello World']])

        const result = buildStream(media, contents)

        expect(result).toHaveLength(3)
        expect(result[0].type).toBe('photos')
        expect(result[1].type).toBe('text')
        expect(result[2].type).toBe('photos')

        if (result[1].type === 'text') {
            expect(result[1].content).toBe('Hello World')
        }
    })

    it('should handle text without content gracefully', () => {
        const media = [mockMedia('text1', 'text')]
        const result = buildStream(media, new Map())

        expect(result).toHaveLength(1)
        expect(result[0].type).toBe('text')
        if (result[0].type === 'text') {
            expect(result[0].content).toBe('')
        }
    })
})
