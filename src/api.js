const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

function getToken() {
  return localStorage.getItem('authToken')
}

function buildUrl(path, params) {
  let url = `${API_URL}${path}`
  if (params) {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') qs.append(key, value)
    })
    const qsStr = qs.toString()
    if (qsStr) url += `?${qsStr}`
  }
  return url
}

async function request(path, { method = 'GET', body, isForm = false, params } = {}) {
  const headers = {}
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  let fetchBody
  if (isForm) {
    fetchBody = body
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    fetchBody = JSON.stringify(body)
  }

  const res = await fetch(buildUrl(path, params), { method, headers, body: fetchBody })

  if (res.status === 204) return null

  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    const message = data && data.detail
      ? (typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail))
      : `Error ${res.status}`
    const error = new Error(message)
    error.status = res.status
    error.data = data
    throw error
  }

  return data
}

export const api = {
  get: (path, params) => request(path, { method: 'GET', params }),
  post: (path, body, params) => request(path, { method: 'POST', body, params }),
  patch: (path, body, params) => request(path, { method: 'PATCH', body, params }),
  delete: (path, params) => request(path, { method: 'DELETE', params }),
  upload: (path, formData, params) => request(path, { method: 'POST', body: formData, isForm: true, params }),
}

export function setToken(token) {
  localStorage.setItem('authToken', token)
}

export function clearToken() {
  localStorage.removeItem('authToken')
}

export function isAuthenticated() {
  return !!getToken()
}

export async function login(username, password) {
  const data = await request('/auth/login', { method: 'POST', body: { username, password } })
  setToken(data.access_token)
  return data
}

export async function fetchMe() {
  return request('/auth/me')
}

export function logout() {
  clearToken()
  localStorage.removeItem('userFullName')
  localStorage.removeItem('userRole')
  localStorage.removeItem('userName')
  localStorage.removeItem('userId')
}
