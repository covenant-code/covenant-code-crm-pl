import { useState } from 'react'
import { Form, Input, Button, Alert } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import { getErrorMessage } from '../utils/errors'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const { login }             = useAuth()
  const navigate              = useNavigate()

  async function onFinish(values) {
    setLoading(true)
    setError(null)
    try {
      const data = await authApi.login(values)
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
          <p className="text-text-secondary mt-1">Войдите в свой аккаунт</p>
        </div>

        <div
          className="bg-surface rounded-xl p-8"
          style={{ boxShadow: 'var(--shadow-elevated)' }}
        >
          {error && (
            <Alert message={error} type="error" showIcon className="mb-4" />
          )}

          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Введите email' },
                { type: 'email', message: 'Некорректный email' },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="you@example.com" />
            </Form.Item>

            <Form.Item
              label="Пароль"
              name="password"
              rules={[{ required: true, message: 'Введите пароль' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
            </Form.Item>

            <Form.Item className="mb-2">
              <Button type="primary" htmlType="submit" block loading={loading}>
                Войти
              </Button>
            </Form.Item>
          </Form>

          <p className="text-center text-sm text-text-secondary mt-4">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
