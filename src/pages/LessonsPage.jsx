import { useEffect, useState, useCallback } from 'react'
import {
  Table, Button, Modal, Form, Input, Select, DatePicker,
  Popconfirm, message, Space, Tooltip,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, FilterOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { lessonsApi } from '../api/lessons'
import { groupsApi }  from '../api/groups'
import { usersApi }   from '../api/users'
import { PageHeader }  from '../components/common/PageHeader'
import { StatusBadge } from '../components/common/StatusBadge'
import { useAuth }     from '../hooks/useAuth'
import { canManageContent, isTeacher } from '../utils/roles'
import { getErrorMessage, parseProblemDetail } from '../utils/errors'
import { formatDateTime } from '../utils/dates'

const STATUSES = [
  { value: 'SCHEDULED',  label: 'Запланировано' },
  { value: 'COMPLETED',  label: 'Завершено' },
  { value: 'CANCELLED',  label: 'Отменено' },
]

export default function LessonsPage() {
  const { auth }                    = useAuth()
  const canEdit                     = canManageContent(auth?.role)
  const [lessons, setLessons]       = useState([])
  const [groups, setGroups]         = useState([])
  const [teachers, setTeachers]     = useState([])
  const [loading, setLoading]       = useState(false)
  const [filterGroup, setFilterGroup] = useState(null)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editing, setEditing]       = useState(null)
  const [saving, setSaving]         = useState(false)
  const [form]                      = Form.useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = filterGroup ? { groupId: filterGroup } : {}
      let lessonsData

      if (isTeacher(auth?.role) && auth?.userId) {
        lessonsData = await lessonsApi.getByTeacher(auth.userId, params)
      } else {
        lessonsData = await lessonsApi.getAll(params)
      }

      const [groupsData, usersData] = await Promise.all([
        groupsApi.getAll(),
        usersApi.getAll({ role: 'TEACHER' }),
      ])

      setLessons(Array.isArray(lessonsData) ? lessonsData : (lessonsData.content ?? []))
      setGroups(Array.isArray(groupsData) ? groupsData : (groupsData.content ?? []))
      setTeachers(Array.isArray(usersData) ? usersData : (usersData.content ?? []))
    } catch (e) {
      message.error(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [filterGroup, auth])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  function openCreate() {
    setEditing(null)
    form.resetFields()
    setModalOpen(true)
  }

  function openEdit(record) {
    setEditing(record)
    form.setFieldsValue({
      ...record,
      scheduledAt: record.scheduledAt ? dayjs(record.scheduledAt) : undefined,
    })
    setModalOpen(true)
  }

  async function handleSave() {
    let values
    try { values = await form.validateFields() } catch { return }
    if (values.scheduledAt) values.scheduledAt = values.scheduledAt.toISOString()
    setSaving(true)
    try {
      if (editing) {
        await lessonsApi.update(editing.id, values)
        message.success('Занятие обновлено')
      } else {
        await lessonsApi.create(values)
        message.success('Занятие создано')
      }
      setModalOpen(false)
      load()
    } catch (e) {
      const { general } = parseProblemDetail(e)
      message.error(general ?? getErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      await lessonsApi.delete(id)
      message.success('Занятие удалено')
      load()
    } catch (e) {
      message.error(getErrorMessage(e))
    }
  }

  const columns = [
    { title: 'Тема', dataIndex: 'topic', key: 'topic', ellipsis: true },
    {
      title: 'Группа',
      dataIndex: 'groupId',
      key: 'groupId',
      render: (id) => groups.find(g => g.id === id)?.name ?? '—',
    },
    {
      title: 'Преподаватель',
      dataIndex: 'teacherId',
      key: 'teacherId',
      render: (id) => {
        const t = teachers.find(u => u.id === id)
        return t ? `${t.firstName ?? ''} ${t.lastName ?? ''}`.trim() : '—'
      },
    },
    {
      title: 'Дата',
      dataIndex: 'scheduledAt',
      key: 'scheduledAt',
      width: 160,
      render: (v) => v ? formatDateTime(v) : '—',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (v) => <StatusBadge type="lesson" value={v} />,
    },
    canEdit && {
      title: '',
      key: 'actions',
      width: 90,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Редактировать">
            <Button type="text" icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Удалить занятие?"
            onConfirm={() => handleDelete(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ].filter(Boolean)

  return (
    <div>
      <PageHeader
        title="Занятия"
        subtitle="Расписание занятий"
        extra={
          <Space>
            <Select
              placeholder="Все группы"
              allowClear
              style={{ width: 180 }}
              options={groups.map(g => ({ value: g.id, label: g.name }))}
              value={filterGroup}
              onChange={setFilterGroup}
              suffixIcon={<FilterOutlined />}
            />
            {canEdit && (
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                Добавить занятие
              </Button>
            )}
          </Space>
        }
      />

      <Table
        dataSource={lessons}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20, showSizeChanger: false }}
        style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}
      />

      <Modal
        title={editing ? 'Редактировать занятие' : 'Новое занятие'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText={editing ? 'Сохранить' : 'Создать'}
        cancelText="Отмена"
        confirmLoading={saving}
        destroyOnClose
        width={520}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            label="Тема занятия"
            name="topic"
            rules={[{ required: true, message: 'Введите тему' }]}
          >
            <Input placeholder="Введение в Python" />
          </Form.Item>
          <Form.Item
            label="Группа"
            name="groupId"
            rules={[{ required: true, message: 'Выберите группу' }]}
          >
            <Select
              placeholder="Выберите группу"
              options={groups.map(g => ({ value: g.id, label: g.name }))}
            />
          </Form.Item>
          <Form.Item label="Преподаватель" name="teacherId">
            <Select
              placeholder="Выберите преподавателя"
              allowClear
              options={teachers.map(t => ({
                value: t.id,
                label: `${t.firstName ?? ''} ${t.lastName ?? ''}`.trim(),
              }))}
            />
          </Form.Item>
          <Form.Item
            label="Дата и время"
            name="scheduledAt"
            rules={[{ required: true, message: 'Укажите дату' }]}
          >
            <DatePicker
              showTime
              format="DD.MM.YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Выберите дату и время"
            />
          </Form.Item>
          <Form.Item label="Длительность (мин)" name="durationMinutes">
            <Input type="number" min={1} placeholder="90" />
          </Form.Item>
          <Form.Item label="Статус" name="status">
            <Select options={STATUSES} placeholder="Запланировано" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
