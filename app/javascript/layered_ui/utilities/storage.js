export function storageGet(key) {
  try { return localStorage.getItem(key) } catch (e) { return null }
}

export function storageSet(key, value) {
  try { localStorage.setItem(key, value) } catch (e) { /* unavailable */ }
}

export function storageRemove(key) {
  try { localStorage.removeItem(key) } catch (e) { /* unavailable */ }
}

export function storageGetJSON(key) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  } catch (e) { return null }
}
