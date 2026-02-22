'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

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
    const [isAdmin, setIsAdmin] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
            try {
                const res = await fetch('/api/auth/me')
                const { isAdmin } = await res.json()
                setIsAdmin(isAdmin)
            } catch {
                setIsAdmin(false)
            }
        } else {
            setIsAdmin(false)
            setIsEditMode(false)
        }

        setIsLoading(false)
    }

    useEffect(() => {
        checkAdmin()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null)
                if (!session?.user) {
                    setIsAdmin(false)
                    setIsEditMode(false)
                } else {
                    // Re-check admin status when auth state changes
                    checkAdmin()
                }
            }
        )

        return () => subscription.unsubscribe()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
