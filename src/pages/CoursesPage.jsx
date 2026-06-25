import { useEffect, useState, useCallback } from 'react'
import {
  Table, Button, Modal, Form, Input, InputNumber,
  Popconfirm, message, Space, Typography, Select,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { coursesApi } from '../api/courses'
import { PageHeader }  from '../components/common/PageHeader'
import { useAuth }     from '../hooks/useAuth'
import { canManageContent } from '../utils/roles'
import { getErrorMessage } from '../utils/errors'

const { TextArea } = Input

export default function CoursesPage() {
  const { auth }                    = useAuth()
  const canEdit                     = canManageContent(auth?.role)
  const [courses, setCourses]       = useState([])
  const [loading, setLoading]       = useState(false)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editing, setEditing]       = useState(null)
  const [saving, setSaving]         = useState(false)
  const [form]                      = Form.useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await coursesApi.getAll()
      setCourses(Array.isArray(data) ? data : (data.content ?? []))
    } catch (e) {
      message.error(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  function openCreate() {
    setEditing(null)
    form.resetFields()
    setModalOpen(true)
  }

  function openEdit(record) {
    setEditing(record)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  async function handleSave() {
    const values = await form.validateFields()
    setSaving(true)
    try {
      if (editing) {
        await coursesApi.update(editing.id, values)
        message.success('Курс обновлён')
      } else {
        await coursesApi.create(values)
        message.success('Курс создан')
      }
      setModalOpen(false)
      load()
    } catch (e) {
      message.error(getErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      await coursesApi.delete(id)
      message.success('Курс удалён')
      load()
    } catch (e) {
      message.error(getErrorMessage(e))
    }
  }

  const columns = [
    { title: 'Название', dataIndex: 'title', key: 'title', ellipsis: true },
    {
      title: 'Длительность (нед.)',
      dataIndex: 'durationInWeeks',
      key: 'durationInWeeks',
      width: 180,
      render: (v) => v ?? '—',
    },
    {
      title: 'Цена (₽)',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (v) => v != null ? Number(v).toLocaleString('ru-RU') : '—',
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (v) => v ? <Typography.Text type="secondary">{v}</Typography.Text> : '—',
    },
    canEdit && {
      title: '',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Удалить курс?"
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
        title="Курсы"
        subtitle="Управление учебными курсами"
        extra={
          canEdit && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Добавить курс
            </Button>
          )
        }
      />

      <Table
        dataSource={courses}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20, showSizeChanger: false }}
        style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}
      />

      <Modal
        title={editing ? 'Редактировать курс' : 'Новый курс'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText={editing ? 'Сохранить' : 'Создать'}
        cancelText="Отмена"
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            label="Название"
            name="title"
            rules={[{ required: true, message: 'Введите название курса' }]}
          >
            <Input placeholder="Python для начинающих" />
          </Form.Item>
          <Form.Item
            label="Длительность (недель)"
            name="durationInWeeks"
            rules={[{ required: true, message: 'Укажите длительность' }]}
          >
            <InputNumber min={1} max={200} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="Цена (₽)"
            name="price"
            rules={[{ required: true, message: 'Укажите цену (0 для бесплатных)' }]}
          >
            <InputNumber min={0} step={500} style={{ width: '100%' }} placeholder="0" />
          </Form.Item>
          <Form.Item label="Статус" name="status" initialValue="ACTIVE">
            <Select>
              <Select.Option value="ACTIVE">Активный</Select.Option>
              <Select.Option value="ARCHIVED">Архивный</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Описание" name="description">
            <TextArea rows={3} placeholder="Краткое описание курса" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
