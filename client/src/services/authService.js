import { api } from './api.js'

// Всички заявки, свързани с профила и входа, на едно място.
// Всяка функция връща потребителя така, както го пази сървърът:
// { _id, email, firstName, lastName, phone, ... } (без паролата).

// data: { firstName, lastName, email, phone, password, rePassword }
export function register(data) {
  return api.post('/register', data)
}

export function login(email, password) {
  return api.post('/login', { email, password })
}

export function logout() {
  return api.post('/logout')
}

// Забравена парола, стъпка 1: сървърът праща писмо с линк. Връща { message }.
export function forgotPassword(email) {
  return api.post('/forgot-password', { email })
}

// Забравена парола, стъпка 2: token е кодът от линка в писмото.
// Връща потребителя — сървърът веднага го логва.
export function resetPassword(token, password, rePassword) {
  return api.post('/reset-password', { token, password, rePassword })
}

// Връща логнатия потребител или хвърля грешка 401, ако няма активна сесия.
export function getProfile() {
  return api.get('/users/profile')
}
