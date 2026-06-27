import { create } from 'zustand'
import axios    from 'axios'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api'

export const useERPStore = create((set, get) => ({
  user:      null,
  token:     null,
  company:   null,
  isAuth:    false,
  isLoading: true,
  theme:     typeof localStorage !== 'undefined' ? (localStorage.getItem('erp-theme') || 'light') : 'light',
  lang:      typeof localStorage !== 'undefined' ? (localStorage.getItem('erp-lang')  || 'ar')    : 'ar',
  sidebarCollapsed: false,
  unreadNotifications: 0,

  setAuth: (user, token) => {
    const company = user?.company || null
    set({ user, token, company, isAuth: true, isLoading: false })
    try { sessionStorage.setItem('erp-auth', JSON.stringify({ token })) } catch {}
    get().applySettings(user?.language || 'ar', user?.theme || 'light')
  },

  clearAuth: () => {
    set({ user: null, token: null, company: null, isAuth: false, isLoading: false })
    try { sessionStorage.removeItem('erp-auth') } catch {}
  },

  applySettings: (lang, theme) => {
    if (typeof document === 'undefined') return
    const dir = ['ar', 'ur'].includes(lang) ? 'rtl' : 'ltr'
    document.documentElement.dir  = dir
    document.documentElement.lang = lang
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    try { localStorage.setItem('erp-lang', lang); localStorage.setItem('erp-theme', theme) } catch {}
  },

  setLang:  lang  => { set({ lang });  get().applySettings(lang,  get().theme) },
  setTheme: theme => { set({ theme }); get().applySettings(get().lang, theme) },
  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setUnread: n => set({ unreadNotifications: n }),

  updateUser:    u => set(s => ({ user: { ...s.user, ...u } })),
  updateCompany: u => set(s => ({ company: { ...s.company, ...u } })),
}))

// Restore session on load
;(async function restoreSession() {
  try {
    const raw = sessionStorage.getItem('erp-auth')
    if (!raw) { useERPStore.setState({ isLoading: false }); return }
    const { token } = JSON.parse(raw)
    if (!token) { useERPStore.setState({ isLoading: false }); return }
    useERPStore.setState({ token, isAuth: true })
    const res = await axios.get(API + '/auth/me', {
      headers: { Authorization: 'Bearer ' + token }, timeout: 10000,
    })
    if (res.data?.success) {
      const user = res.data.data
      useERPStore.setState({ user, company: user.company, isAuth: true, isLoading: false })
      useERPStore.getState().applySettings(user.language || 'ar', user.theme || 'light')
    } else {
      useERPStore.setState({ isLoading: false })
    }
  } catch (err) {
    if (err.response?.status === 401) {
      try { sessionStorage.removeItem('erp-auth') } catch {}
      useERPStore.setState({ user:null, token:null, company:null, isAuth:false })
    }
    useERPStore.setState({ isLoading: false })
  }
})()
