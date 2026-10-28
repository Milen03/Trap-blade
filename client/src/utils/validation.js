// Същите правила като в server/utils/validators.js — проверяваме и тук,
// за да покажем грешката веднага, без да чакаме отговор от сървъра.

// Цифри, интервали, тирета, скоби и "+" отпред. Пример: "0888 123 456" или "+359 888 123 456".
export const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/

export const MIN_PASSWORD_LENGTH = 6

// Връща текст на грешката или '' (празно), ако всичко е наред.
export function validateProfile({ firstName, lastName, phone }) {
  if (!firstName.trim()) return 'Въведи име'
  if (!lastName.trim()) return 'Въведи фамилия'
  if (!phone.trim()) return 'Въведи телефон'
  if (!PHONE_REGEX.test(phone.trim())) return 'Невалиден телефонен номер'
  return ''
}
