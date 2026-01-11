
'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function PrintButton() {
    return (
        <Button
            size="sm"
            variant="outline"
            className="mt-4 print:hidden"
            onClick={() => window.print()}
        >
            <Download className="mr-2 h-4 w-4" /> Download PDF
        </Button>
    )
}
