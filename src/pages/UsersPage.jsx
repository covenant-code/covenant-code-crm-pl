import { useEffect, useState, useCallback } from 'react'
import { Table, Switch, message, Tag, Typography, Avatar } from 'antd'
import { usersApi }    from '../api/users'
import { PageHeader }  from '../components/common/PageHeader'
import { ROLE_LABELS, ROLE_COLORS } from '../utils/roles'
import { getErrorMessage } from '../utils/errors'

const { Text } = Typography

export default function UsersPage() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await usersApi.getAll()
      setUsers(Array.isArray(data) ? data : (data.content ?? []))
    } catch (e) {
      message.error(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  async function toggleEnabled(user) {
    try {
      await usersApi.toggleEnabled(user.id, !user.enabled)
      load()
    } catch (e) {
      message.error(getErrorMessage(e))
    }
  }

  const columns = [
    {
      title: 'Пользователь',
      key: 'user',
      render: (_, r) => (
        <div className="flex items-center gap-2">
          <Avatar size="small" style={{ backgroundColor: '#1677ff' }}>
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
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      width: 160,
      render: (role) => (
        <Tag color={ROLE_COLORS[role] ?? 'default'}>
          {ROLE_LABELS[role] ?? role ?? '—'}
        </Tag>
      ),
    },
    {
      title: 'Активен',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled, record) => (
        <Switch
          checked={enabled}
          size="small"
          onChange={() => toggleEnabled(record)}
          checkedChildren="Да"
          unCheckedChildren="Нет"
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Пользователи"
        subtitle="Управление аккаунтами (только для администратора)"
      />

      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20, showSizeChanger: false }}
        style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}
      />
    </div>
  )
}
