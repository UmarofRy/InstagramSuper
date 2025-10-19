import api from './axiosInstance.js'

const BASE = 'https://689c7c5858a27b18087e5fc6.mockapi.io/users/UmarovPerson'

export async function getAllRecords() {
  const { data } = await api.get(BASE)
  return data
}
export async function getUsers() {
  const data = await getAllRecords()
  return (data || []).filter((r) => (r.recordType || 'user') === 'user')
}
export async function getPosts() {
  const data = await getAllRecords()
  return (data || [])
    .filter((r) => r.recordType === 'post' || (!r.recordType && r.mediaUrl))
    .map((p) => ({ ...p, likedBy: Array.isArray(p.likedBy) ? p.likedBy : [] }))
}
export async function createUser(payload) {
  const { data } = await api.post(BASE, payload)
  return data
}
export async function createPost(payload) {
  const { data } = await api.post(BASE, payload)
  return data
}
export async function updateRecord(id, payload) {
  const { data } = await api.put(`${BASE}/${id}`, payload)
  return data
}
export async function deleteRecord(id) {
  const { data } = await api.delete(`${BASE}/${id}`)
  return data
}

export async function toggleLike(post, userId) {
  const likedBy = new Set(Array.isArray(post.likedBy) ? post.likedBy.map(String) : [])
  const uid = String(userId)
  if (likedBy.has(uid)) likedBy.delete(uid); else likedBy.add(uid)
  const payload = { ...post, likedBy: Array.from(likedBy) }
  const updated = await updateRecord(post.id, payload)
  return { ...updated, likedBy: Array.isArray(updated.likedBy) ? updated.likedBy : [] }
}
