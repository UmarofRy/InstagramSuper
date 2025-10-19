import api from './axiosInstance.js'

const BASE = 'https://689c7c5858a27b18087e5fc6.mockapi.io/users/UmarovComment'

export async function getComments() {
  const { data } = await api.get(BASE)
  return data
}
export async function createComment(payload) {
  const { data } = await api.post(BASE, payload)
  return data
}
export async function updateComment(id, payload) {
  const { data } = await api.put(`${BASE}/${id}`, payload)
  return data
}
export async function deleteComment(id) {
  const { data } = await api.delete(`${BASE}/${id}`)
  return data
}
