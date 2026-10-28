import { api } from './api.js'

// Всички заявки, свързани с профила и входа, на едно място.
// Всяка функция връща потребителя така, както го пази сървърът:
// { _id, email, firstName, lastName, phone, ... } (без паролата).

// data: { firstName, lastName, email, phone, password, rePassword }
export function register(data) {
  return api.post('/register', data)
}

// remember: true -> оставаш логнат 7 дни, false -> до затваряне на браузъра.
export function login(email, password, remember) {
  return api.post('/login', { email, password, remember })
}

export function logout() {
  return api.post('/logout')
}

// Връща логнатия потребител или хвърля грешка 401, ако няма активна сесия.
export function getProfile() {
  return api.get('/users/profile')
}
