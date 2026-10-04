export const TOKEN_KEY = 'wordle-duel-token'

/** API + Socket.IO base (no trailing slash). */
function apiBase() {
  return import.meta.env.VITE_API_URL || 'https://wordle-war-be-em84.onrender.com'
}

export function getSocketUrl() {
  return apiBase()
}

export function apiUrl(path) {
  const base = apiBase()
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}
