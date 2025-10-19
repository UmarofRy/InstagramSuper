import api from './axiosInstance.js'

const BASE = 'https://688a16e14c55d5c73954f244.mockapi.io/UmarovCvarteera/Umarov'

export async function listMessages() {
  const { data } = await api.get(BASE)
  return data
}
export async function sendMessage(senderId, receiverId, content) {
  const payload = { senderId, receiverId, content, timestamp: Date.now() }
  const { data } = await api.post(BASE, payload)
  return data
}
