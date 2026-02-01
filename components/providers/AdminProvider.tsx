'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { isAdminUser } from '@/lib/auth/shared'

interface AdminContextType {
    user: User | null
    isAdmin: boolean
    isEditMode: boolean
    setIsEditMode: (mode: boolean) => void
    isLoading: boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setIsLoading(false)
        }

        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null)
                if (!session?.user) {
                    setIsEditMode(false)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [supabase])

    const isAdmin = isAdminUser(user)

    return (
        <AdminContext.Provider value={{ user, isAdmin, isEditMode, setIsEditMode, isLoading }}>
            {children}
        </AdminContext.Provider>
    )
}

export function useAdmin() {
    const context = useContext(AdminContext)
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider')
    }
    return context
}
