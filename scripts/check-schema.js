const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://klamgzpzybxlwzkplsca.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsYW1nenB6eWJ4bHd6a3Bsc2NhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODA2OTM0MSwiZXhwIjoyMDgzNjQ1MzQxfQ.rGZvALc9QWsnwtFPMVr5aQdyYEGq0FGNmhIaRpJxyvk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectSchema() {
    try {
        console.log('--- Inspecting Media Table Columns ---')
        // We can query information_schema if we have permissions, but often we don't via PostgREST.
        // Let's try a direct query for one record and look at metadata if possible, 
        // or just try to update content_id with a known UUID vs a random string.

        const { data, error } = await supabase
            .from('media')
            .select('*')
            .limit(1)

        if (error) {
            console.error('Fetch error:', error)
            return
        }

        console.log('Columns in media:', Object.keys(data[0] || {}))

        console.log('\n--- Testing content_id update ---')
        const firstId = data[0]?.id
        if (!firstId) {
            console.log('No media records found to test update.')
            return
        }

        // Test updating it to its own ID (self-reference)
        const { error: updateError } = await supabase
            .from('media')
            .update({ content_id: firstId })
            .eq('id', firstId)

        if (updateError) {
            console.error('Self-reference update error:', updateError.message)
            console.error('Error details:', updateError)
        } else {
            console.log('Self-reference update successful!')
        }

        // Test updating it to a random string (non-UUID)
        const { error: stringError } = await supabase
            .from('media')
            .update({ content_id: 'not-a-uuid' })
            .eq('id', firstId)

        if (stringError) {
            console.log('String update failed (as expected if UUID):', stringError.message)
        } else {
            console.log('String update successful! content_id is likely TEXT.')
        }

    } catch (e) {
        console.error('Unexpected error:', e)
    }
}

inspectSchema()
