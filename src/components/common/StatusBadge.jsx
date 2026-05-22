import { Tag } from 'antd'

const LEAD_STATUS = {
  NEW:            { label: 'Новый',           color: 'blue' },
  CONTACTED:      { label: 'Контакт',         color: 'cyan' },
  INTERESTED:     { label: 'Заинтересован',   color: 'gold' },
  NOT_INTERESTED: { label: 'Не заинтересован', color: 'default' },
  CONVERTED:      { label: 'Конвертирован',   color: 'green' },
}

const GROUP_STATUS = {
  FORMING:   { label: 'Набор',     color: 'blue' },
  ACTIVE:    { label: 'Активна',   color: 'green' },
  COMPLETED: { label: 'Завершена', color: 'default' },
  CANCELLED: { label: 'Отменена',  color: 'red' },
}

const LESSON_STATUS = {
  SCHEDULED:  { label: 'Запланирован', color: 'blue' },
  COMPLETED:  { label: 'Завершён',     color: 'green' },
  CANCELLED:  { label: 'Отменён',      color: 'red' },
}

const MAPS = { lead: LEAD_STATUS, group: GROUP_STATUS, lesson: LESSON_STATUS }

export function StatusBadge({ type, value }) {
  const map = MAPS[type] ?? {}
  const cfg = map[value]
  if (!cfg) return <Tag>{value}</Tag>
  return <Tag color={cfg.color}>{cfg.label}</Tag>
}
