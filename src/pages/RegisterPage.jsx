import { useState } from 'react'
import { Form, Input, Button, Alert } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import { getErrorMessage } from '../utils/errors'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const { login }             = useAuth()
  const navigate              = useNavigate()

  async function onFinish({ firstName, lastName, email, password }) {
    setLoading(true)
    setError(null)
    try {
      const data = await authApi.register({ firstName, lastName, email, password })
      login(data)
      navigate('/', { replace: true })
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Covenant Code CRM</h1>
          <p className="text-text-secondary mt-1">Создайте аккаунт</p>
        </div>

        <div
          className="bg-surface rounded-xl p-8"
          style={{ boxShadow: 'var(--shadow-elevated)' }}
        >
          {error && (
            <Alert message={error} type="error" showIcon className="mb-4" />
          )}

          <Form layout="vertical" onFinish={onFinish} size="large">
            <div className="grid grid-cols-2 gap-3">
              <Form.Item
                label="Имя"
                name="firstName"
                rules={[{ required: true, message: 'Введите имя' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Иван" />
              </Form.Item>
              <Form.Item
                label="Фамилия"
                name="lastName"
                rules={[{ required: true, message: 'Введите фамилию' }]}
              >
                <Input placeholder="Иванов" />
              </Form.Item>
            </div>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Введите email' },
                { type: 'email', message: 'Некорректный email' },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="you@example.com" />
            </Form.Item>

            <Form.Item
              label="Пароль"
              name="password"
              rules={[
                { required: true, message: 'Введите пароль' },
                { min: 6, message: 'Минимум 6 символов' },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
            </Form.Item>

            <Form.Item
              label="Повторите пароль"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Повторите пароль' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) return Promise.resolve()
                    return Promise.reject('Пароли не совпадают')
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
            </Form.Item>

            <Form.Item className="mb-2">
              <Button type="primary" htmlType="submit" block loading={loading}>
                Зарегистрироваться
              </Button>
            </Form.Item>
          </Form>

          <p className="text-center text-sm text-text-secondary mt-4">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
