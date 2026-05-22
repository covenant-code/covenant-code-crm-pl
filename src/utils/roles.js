export const ROLES = {
  ADMIN:   'ADMIN',
  MANAGER: 'MANAGER',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
}

export const ROLE_LABELS = {
  ADMIN:   'Администратор',
  MANAGER: 'Менеджер',
  TEACHER: 'Преподаватель',
  STUDENT: 'Студент',
}

// Цвета для бейджей ролей (Ant Design color prop)
export const ROLE_COLORS = {
  ADMIN:   'red',
  MANAGER: 'blue',
  TEACHER: 'green',
  STUDENT: 'purple',
}

export const isAdmin   = (role) => role === ROLES.ADMIN
export const isManager = (role) => role === ROLES.MANAGER
export const isTeacher = (role) => role === ROLES.TEACHER
export const isStudent = (role) => role === ROLES.STUDENT

export const canManageContent = (role) =>
  role === ROLES.ADMIN || role === ROLES.MANAGER
