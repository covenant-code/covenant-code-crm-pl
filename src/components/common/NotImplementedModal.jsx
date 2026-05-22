import { Modal, Typography } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'

const { Text } = Typography

export function showNotImplemented(featureName) {
  Modal.info({
    title: 'Функционал в разработке',
    icon: <ClockCircleOutlined style={{ color: '#faad14' }} />,
    content: (
      <div style={{ paddingTop: 8 }}>
        <Text style={{ color: '#8096b0' }}>
          {featureName
            ? `«${featureName}» пока не реализован на бекенде.`
            : 'Этот функционал пока не реализован на бекенде.'}
        </Text>
        <br />
        <Text style={{ color: '#4a607a', fontSize: 12 }}>
          Он появится после реализации соответствующего API-эндпоинта.
        </Text>
      </div>
    ),
    okText: 'Понятно',
    centered: true,
  })
}
