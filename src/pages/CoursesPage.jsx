import { useEffect, useState, useCallback } from 'react'
import {
  Table, Button, Modal, Form, Input, InputNumber,
  Popconfirm, message, Space, Typography,
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
    { title: 'Название', dataIndex: 'name', key: 'name', ellipsis: true },
    {
      title: 'Длительность (ч)',
      dataIndex: 'durationHours',
      key: 'durationHours',
      width: 160,
      render: (v) => v ?? '—',
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
            name="name"
            rules={[{ required: true, message: 'Введите название курса' }]}
          >
            <Input placeholder="Python для начинающих" />
          </Form.Item>
          <Form.Item label="Длительность (часов)" name="durationHours">
            <InputNumber min={1} max={1000} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Описание" name="description">
            <TextArea rows={3} placeholder="Краткое описание курса" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
