import api from './axiosInstance.js'

const BASE = 'https://68986980ddf05523e55ed4e8.mockapi.io/home/Notfiy'

export async function listNotifications() {
  const { data } = await api.get(BASE)
  return data
}
export async function createNotification(payload) {
  const { data } = await api.post(BASE, payload)
  return data
}
export async function markRead(id, payload) {
  const { data } = await api.put(`${BASE}/${id}`, payload)
  return data
}
