import { api } from './api.js'

// Публичният списък с бръснарите: [{ _id, firstName, lastName, title, isLead, services }].
export function getBarbers() {
  return api.get('/barbers')
}
