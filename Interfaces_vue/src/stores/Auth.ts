import { defineStore } from 'pinia'
import { userService } from '@/services/project_2/userService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as null | { user_id: string; user_name: string, email: string; role: string },
    loading: false,
  }),

  actions: {
    async login(data: { email: string; password: string }) {
      this.loading = true
      try {
        const res = await userService.login(data)
        if (res && res.status) {
          this.user = {
            ...res.data,
            role: res.data.role?.name || res.data.role,
          }
          return true
        }
      } catch (e) {
        console.error('Login error:', e)
      } finally {
        this.loading = false
      }
      return false
    },

    async logout() {
      await userService.logout()
      this.user = null
    },

    async checkSession() {
      try {
        const res = await userService.getSectionId()
        if (res && res.status) {
          this.user = {
            ...res.data,
            role: res.data.role?.name || res.data.role,
          }
          
          return true
        }
      } catch (e) {
        this.user = null
      }
      return false
    },
  },

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
  },
})
