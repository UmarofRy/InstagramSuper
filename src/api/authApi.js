import api from './axiosInstance.js'

const BASE = 'https://688a16e14c55d5c73954f244.mockapi.io/UmarovCvarteera/Clinc'

export async function listAuthUsers() {
  const { data } = await api.get(BASE)
  return data
}

export async function registerAuthUser(payload) {
  const { data } = await api.post(BASE, payload)
  return data
}
