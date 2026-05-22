import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Result
        status="404"
        title={<span className="text-text-primary">404</span>}
        subTitle={<span className="text-text-secondary">Страница не найдена</span>}
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            На главную
          </Button>
        }
      />
    </div>
  )
}
