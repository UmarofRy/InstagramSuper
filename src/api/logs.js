import api from './axiosInstance.js'

const BASE = 'https://68986980ddf05523e55ed4e8.mockapi.io/home/umarov'

export async function listLogs() {
  const { data } = await api.get(BASE)
  return data
}
export async function createLog(payload) {
  const { data } = await api.post(BASE, payload)
  return data
}
export async function deleteLog(id) {
  const { data } = await api.delete(`${BASE}/${id}`)
  return data
}
