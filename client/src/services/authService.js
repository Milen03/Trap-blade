import { api } from './api.js'

// Всички заявки, свързани с профила и входа, на едно място.
// Всяка функция връща потребителя така, както го пази сървърът:
// { _id, email, firstName, lastName, phone, profileComplete, ... } (без паролата).

// data: { firstName, lastName, email, phone, password, rePassword }
export function register(data) {
  return api.post('/register', data)
}

// remember: true -> оставаш логнат 7 дни, false -> до затваряне на браузъра.
export function login(email, password, remember) {
  return api.post('/login', { email, password, remember })
}

// credential: ID token, който Google връща след успешен вход.
export function loginWithGoogle(credential) {
  return api.post('/login/google', { credential })
}

// idToken: токенът от Apple. Името Apple дава само при първия вход, затова го пращаме отделно.
export function loginWithApple({ idToken, firstName, lastName }) {
  return api.post('/login/apple', { idToken, firstName, lastName })
}

export function logout() {
  return api.post('/logout')
}

// Връща логнатия потребител или хвърля грешка 401, ако няма активна сесия.
export function getProfile() {
  return api.get('/users/profile')
}

// data: { firstName, lastName, phone }
export function updateProfile(data) {
  return api.put('/users/profile', data)
}
