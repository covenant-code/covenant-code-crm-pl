import { useEffect, useState, useCallback } from 'react'
import {
  Table, Button, Modal, Form, Input, Popconfirm, message,
  Space, Tooltip, DatePicker,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { studentsApi } from '../api/students'
import { PageHeader }  from '../components/common/PageHeader'
import { useAuth }     from '../hooks/useAuth'
import { canManageContent } from '../utils/roles'
import { getErrorMessage, parseProblemDetail } from '../utils/errors'
import { formatDate } from '../utils/dates'

export default function StudentsPage() {
  const { auth }                    = useAuth()
  const canEdit                     = canManageContent(auth?.role)
  const [students, setStudents]     = useState([])
  const [loading, setLoading]       = useState(false)
  const [search, setSearch]         = useState('')
  const [modalOpen, setModalOpen]   = useState(false)
  const [editing, setEditing]       = useState(null)
  const [saving, setSaving]         = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [form]                      = Form.useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = search ? { search } : {}
      const data   = await studentsApi.getAll(params)
      setStudents(Array.isArray(data) ? data : (data.content ?? []))
    } catch (e) {
      message.error(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { load() }, [load])

  function openCreate() {
    setEditing(null)
    setFormErrors({})
    form.resetFields()
    setModalOpen(true)
  }

  function openEdit(record) {
    setEditing(record)
    setFormErrors({})
    form.setFieldsValue({
      ...record,
      birthDate: record.birthDate ? dayjs(record.birthDate) : undefined,
    })
    setModalOpen(true)
  }

  async function handleSave() {
    let values
    try { values = await form.validateFields() } catch { return }
    if (values.birthDate) values.birthDate = values.birthDate.format('YYYY-MM-DD')
    setSaving(true)
    setFormErrors({})
    try {
      if (editing) {
        await studentsApi.update(editing.id, values)
        message.success('Студент обновлён')
      } else {
        await studentsApi.create(values)
        message.success('Студент добавлен')
      }
      setModalOpen(false)
      load()
    } catch (e) {
      const { general, fields } = parseProblemDetail(e)
      if (fields) setFormErrors(fields)
      if (general) message.error(general)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      await studentsApi.delete(id)
      message.success('Студент удалён')
      load()
    } catch (e) {
      message.error(getErrorMessage(e))
    }
  }

  const columns = [
    {
      title: 'Студент',
      key: 'name',
      render: (_, r) => `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim() || '—',
    },
    { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true },
    { title: 'Телефон', dataIndex: 'phone', key: 'phone', width: 150 },
    {
      title: 'Дата рождения',
      dataIndex: 'birthDate',
      key: 'birthDate',
      width: 140,
      render: (v) => v ? formatDate(v) : '—',
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
            title="Удалить студента?"
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
        title="Студенты"
        subtitle="Управление студентами"
        extra={
          <Space>
            <Input
              placeholder="Поиск по имени..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={e => setSearch(e.target.value)}
              allowClear
              style={{ width: 220 }}
            />
            {canEdit && (
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                Добавить студента
              </Button>
            )}
          </Space>
        }
      />

      <Table
        dataSource={students}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20, showSizeChanger: false }}
        style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}
      />

      <Modal
        title={editing ? 'Редактировать студента' : 'Новый студент'}
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
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item
              label="Имя"
              name="firstName"
              rules={[{ required: true, message: 'Введите имя' }]}
              validateStatus={formErrors.firstName ? 'error' : undefined}
              help={formErrors.firstName}
            >
              <Input placeholder="Иван" />
            </Form.Item>
            <Form.Item
              label="Фамилия"
              name="lastName"
              rules={[{ required: true, message: 'Введите фамилию' }]}
              validateStatus={formErrors.lastName ? 'error' : undefined}
              help={formErrors.lastName}
            >
              <Input placeholder="Иванов" />
            </Form.Item>
          </div>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ type: 'email', message: 'Некорректный email' }]}
            validateStatus={formErrors.email ? 'error' : undefined}
            help={formErrors.email}
          >
            <Input placeholder="ivan@example.com" />
          </Form.Item>
          <Form.Item
            label="Телефон"
            name="phone"
            validateStatus={formErrors.phone ? 'error' : undefined}
            help={formErrors.phone}
          >
            <Input placeholder="+7 999 123-45-67" />
          </Form.Item>
          <Form.Item label="Дата рождения" name="birthDate">
            <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
