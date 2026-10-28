import { createContext } from 'react'

// "Кутия", в която AuthProvider слага логнатия потребител и функциите за вход/изход.
// Всеки компонент може да ги вземе с useAuth(), без да ги подаваме през props.
export const AuthContext = createContext(null)
