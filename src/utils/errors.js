// Парсит ProblemDetail (RFC 7807) ответы от бекенда
export function parseProblemDetail(error) {
  const data = error?.response?.data

  if (!data) {
    return { general: 'Ошибка сети. Проверьте подключение.', fields: {} }
  }

  // Ошибки валидации — массив { field, message }
  if (data.type === 'validation-error' && Array.isArray(data.errors)) {
    const fields = {}
    data.errors.forEach(({ field, message }) => {
      fields[field] = message
    })
    return { general: null, fields }
  }

  // Любая другая ошибка с detail
  return {
    general: data.detail || data.title || 'Произошла ошибка',
    fields: {},
  }
}

// Возвращает читаемое сообщение по HTTP-статусу
export function getErrorMessage(error) {
  const status = error?.response?.status
  const detail = error?.response?.data?.detail

  if (detail) return detail

  switch (status) {
    case 400: return 'Некорректный запрос'
    case 401: return 'Необходима авторизация'
    case 403: return 'Доступ запрещён'
    case 404: return 'Ресурс не найден'
    case 409: return 'Конфликт данных'
    case 500: return 'Ошибка сервера. Попробуйте позже.'
    default:  return 'Произошла ошибка'
  }
}
