import { useEffect, useState, useCallback } from 'react'
import { Table, message, Tag, Typography, Avatar } from 'antd'
import { usersApi }    from '../api/users'
import { PageHeader }  from '../components/common/PageHeader'
import { getErrorMessage } from '../utils/errors'

const { Text } = Typography

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await usersApi.getAll()
      const all  = Array.isArray(data) ? data : (data.content ?? [])
      setTeachers(all.filter(u => u.role === 'TEACHER'))
    } catch (e) {
      message.error(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  const columns = [
    {
      title: 'Преподаватель',
      key: 'name',
      render: (_, r) => (
        <div className="flex items-center gap-2">
          <Avatar size="small" style={{ backgroundColor: '#52c41a' }}>
            {(r.firstName?.[0] ?? r.email?.[0] ?? '?').toUpperCase()}
          </Avatar>
          <div>
            <div className="text-text-primary">
              {`${r.firstName ?? ''} ${r.lastName ?? ''}`.trim() || '—'}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>{r.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 120,
      render: (enabled) => (
        <Tag color={enabled ? 'green' : 'default'}>
          {enabled ? 'Активен' : 'Заблокирован'}
        </Tag>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Преподаватели"
        subtitle="Список преподавателей образовательного центра"
      />

      <Table
        dataSource={teachers}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20, showSizeChanger: false }}
        style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}
      />
    </div>
  )
}
