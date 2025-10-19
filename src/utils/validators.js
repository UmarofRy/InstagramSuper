export const emailValid = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)
export const nicknameValid = (n) => /^[A-Za-z0-9._]{8,}$/.test(n)
export const passwordValid = (p) => /^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/.test(p)
