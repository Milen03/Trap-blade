// Роли от сървъра: client (клиент), barber (бръснар), owner (собственик / главен бръснар).
export const STAFF_ROLES = ['barber', 'owner']

// Бръснар или собственик — те имат панел за графика.
export function isStaff(user) {
  return Boolean(user) && STAFF_ROLES.includes(user.role)
}

// Къде отива потребителят след вход: бръснарите — в панела, клиентите — на началната страница.
export function homePath(user) {
  return isStaff(user) ? '/panel' : '/'
}
