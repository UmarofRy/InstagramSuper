import axios from 'axios'

const instance = axios.create({
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

instance.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem('svapp_user') || 'null')
    if (user?.id) {
      config.headers['X-Auth-User'] = String(user.id)
    }
  } catch (e) {
    // Silently ignore localStorage parse errors
    void e
  }
  return config
})

export default instance
