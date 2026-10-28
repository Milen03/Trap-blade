// Базов адрес на API-то.
// В development е '/api' и Vite го препраща към http://localhost:3000 (виж vite.config.js).
// В production задаваш VITE_API_URL, например https://trapblade-api.up.railway.app/api
const API_URL = import.meta.env.VITE_API_URL || '/api'

// Обща функция за всички заявки към сървъра.
// Връща JSON отговора или хвърля Error със съобщението от сървъра (на български).
async function request(method, path, body) {
  const options = {
    method,
    // Без това браузърът НЕ праща и НЕ запазва бисквитката с токена за вход.
    credentials: 'include',
    headers: {},
  }

  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(API_URL + path, options)
  } catch {
    // fetch гърми само ако изобщо няма връзка (сървърът е спрян, няма интернет...).
    throw new Error('Няма връзка със сървъра. Опитай отново след малко.')
  }

  // 204 No Content (например при logout) — няма тяло за четене.
  if (response.status === 204) {
    return null
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(data?.message || 'Нещо се обърка. Опитай отново.')
    // Пазим статуса (401, 409...), ако някой компонент иска да реагира различно.
    error.status = response.status
    throw error
  }

  return data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
}
