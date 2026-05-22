// Форматирует ISO строку в DD.MM.YYYY HH:mm
export function formatDateTime(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Форматирует ISO строку или LocalDate в DD.MM.YYYY
export function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
}

// Форматирует LocalTime строку HH:mm:ss → HH:mm
export function formatTime(value) {
  if (!value) return '—'
  return String(value).slice(0, 5)
}
