import api from './axiosInstance.js'

const BASE = 'https://68f28407b36f9750deece249.mockapi.io/Admin'
const CACHE_KEY = 'svapp_admins_cache'
const CACHE_TTL = 60 * 1000 // 60s

export async function getAdmins() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
    if (cached && Array.isArray(cached.data) && (Date.now() - (cached.ts || 0)) < CACHE_TTL) {
      return cached.data
    }
    const res = await api.get(BASE)
    const data = res?.data || []
    if (res?.status === 200) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
    } else {
      console.warn('getAdmins non-200 status:', res?.status)
    }
    return data
  } catch (err) {
    console.error('getAdmins error:', err)
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
      if (cached?.data) return cached.data
    } catch (e) {
      void e
    }
    return []
  }
}

export async function getAdminById(id) {
  try {
    const res = await api.get(`${BASE}/${id}`)
    if (res?.status !== 200) console.warn('getAdminById non-200 status:', res?.status)
    return res?.data
  } catch (err) {
    console.error('getAdminById error:', err)
    return null
  }
}

export async function createAdmin(payload) {
  try {
    const res = await api.post(BASE, payload)
    if (res?.status !== 201 && res?.status !== 200) console.warn('createAdmin status:', res?.status)
    const created = res?.data
    try { // update cache
      const current = await getAdmins()
      const next = [...current, created]
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: next }))
    } catch (e) {
      void e
    }
    return created
  } catch (err) {
    console.error('createAdmin error:', err)
    throw err
  }
}

export async function updateAdmin(id, data) {
  try {
    const res = await api.put(`${BASE}/${id}`, data)
    if (res?.status !== 200) console.warn('updateAdmin status:', res?.status)
    const updated = res?.data
    try {
      const current = await getAdmins()
      const next = current.map(a => String(a.id) === String(id) ? updated : a)
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: next }))
    } catch (e) {
      void e
    }
    return updated
  } catch (err) {
    console.error('updateAdmin error:', err)
    throw err
  }
}

export async function deleteAdmin(id) {
  try {
    const res = await api.delete(`${BASE}/${id}`)
    if (res?.status !== 200) console.warn('deleteAdmin status:', res?.status)
    try {
      const current = await getAdmins()
      const next = current.filter(a => String(a.id) !== String(id))
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: next }))
    } catch (e) {
      void e
    }
    return res?.data
  } catch (err) {
    console.error('deleteAdmin error:', err)
    throw err
  }
}

export function invalidateAdminsCache(){ localStorage.removeItem(CACHE_KEY) }
