import api from './axiosInstance.js'

const BASE = 'https://68f28407b36f9750deece249.mockapi.io/follow'

export async function listFollows() {
  const { data } = await api.get(BASE)
  return data
}
export async function follow(followerId, followingId) {
  const payload = { followerId, followingId, createdAt: new Date().toISOString() }
  const { data } = await api.post(BASE, payload)
  return data
}
export async function unfollow(id) {
  const { data } = await api.delete(`${BASE}/${id}`)
  return data
}
