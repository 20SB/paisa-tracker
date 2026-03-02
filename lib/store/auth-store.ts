/**
 * Authentication Store (Zustand)
 * Client-side auth state management
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  _id: string
  email: string
  name: string
  preferences: {
    currency: string
    theme: string
    language: string
  }
  onboardingCompleted: boolean
}

interface AuthStore {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loading: boolean
  
  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: true,

      setAuth: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          loading: false,
        })
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          loading: false,
        })
      },

      setLoading: (loading) => {
        set({ loading })
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }))
      },
    }),
    {
      name: 'paisa-tracker-auth',
    }
  )
)

// Helper function to get token
export const getAuthToken = () => useAuthStore.getState().accessToken
