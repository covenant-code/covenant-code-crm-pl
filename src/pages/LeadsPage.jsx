import { useEffect, useState, useCallback } from 'react'
import {
  Table, Button, Modal, Drawer, Form, Input, Select,
  message, Space, Tooltip, Divider,
  List, Typography, Empty,
} from 'antd'
import {
  PlusOutlined, EditOutlined, CommentOutlined,
  SwapOutlined, FilterOutlined,
} from '@ant-design/icons'
import { leadsApi }    from '../api/leads'
import { coursesApi }  from '../api/courses'
import { PageHeader }  from '../components/common/PageHeader'
import { StatusBadge } from '../components/common/StatusBadge'
import { useAuth }     from '../hooks/useAuth'
import { canManageContent } from '../utils/roles'
import { getErrorMessage, parseProblemDetail } from '../utils/errors'
import { formatDateTime } from '../utils/dates'

const { TextArea } = Input
const { Text }     = Typography

const STATUSES = [
  { value: 'NEW',                  label: 'Новый' },
  { value: 'IN_PROGRESS',          label: 'В работе' },
  { value: 'CONTACTED',            label: 'Контакт' },
  { value: 'CONVERTED_TO_STUDENT', label: 'Конвертирован' },
  { value: 'REJECTED',             label: 'Отказ' },
]

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Все статусы' },
  ...STATUSES,
]

export default function LeadsPage() {
  const { auth }                        = useAuth()
  const canEdit                         = canManageContent(auth?.role)
  const [leads, setLeads]               = useState([])
  const [courses, setCourses]           = useState([])
  const [loading, setLoading]           = useState(false)
  const [filterStatus, setFilterStatus] = useState(null)

  const [modalOpen, setModalOpen]       = useState(false)
  const [editing, setEditing]           = useState(null)
  const [saving, setSaving]             = useState(false)
  const [formErrors, setFormErrors]     = useState({})
  const [form]                          = Form.useForm()

  const [commentsOpen, setCommentsOpen] = useState(false)
  const [activeLead, setActiveLead]     = useState(null)
  const [comments, setComments]         = useState([])
  const [commentText, setCommentText]   = useState('')
  const [sendingComment, setSendingComment] = useState(false)

  const [convertOpen, setConvertOpen]   = useState(false)
  const [convertLead, setConvertLead]   = useState(null)
  const [convertForm]                   = Form.useForm()
  const [converting, setConverting]     = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = filterStatus ? { status: filterStatus } : {}
      const [leadsData, coursesData] = await Promise.all([
        leadsApi.getAll(params),
        coursesApi.getAll(),
      ])
      setLeads(Array.isArray(leadsData) ? leadsData : (leadsData.content ?? []))
      setCourses(Array.isArray(coursesData) ? coursesData : (coursesData.content ?? []))
    } catch (e) {
      message.error(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  // eslint-disable-next-line react-hooks/set-state-in-effect
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
      interestedCourseId: record.interestedCourse?.id ?? null,
    })
    setModalOpen(true)
  }

  async function handleSave() {
    let values
    try { values = await form.validateFields() } catch { return }
    setSaving(true)
    setFormErrors({})
    try {
      if (editing) {
        await leadsApi.update(editing.id, values)
        message.success('Лид обновлён')
      } else {
        await leadsApi.create(values)
        message.success('Лид создан')
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

  async function handleStatusChange(id, status) {
    try {
      await leadsApi.updateStatus(id, status)
      load()
    } catch (e) {
      message.error(getErrorMessage(e))
    }
  }

  async function openComments(lead) {
    setActiveLead(lead)
    setComments([])
    setCommentsOpen(true)
    try {
      const data = await leadsApi.getComments(lead.id)
      setComments(Array.isArray(data) ? data : [])
    } catch (e) {
      message.error(getErrorMessage(e))
    }
  }

  async function sendComment() {
    if (!commentText.trim()) return
    setSendingComment(true)
    try {
      await leadsApi.addComment(activeLead.id, commentText.trim())
      setCommentText('')
      const data = await leadsApi.getComments(activeLead.id)
      setComments(Array.isArray(data) ? data : [])
    } catch (e) {
      message.error(getErrorMessage(e))
    } finally {
      setSendingComment(false)
    }
  }

  function openConvert(lead) {
    setConvertLead(lead)
    convertForm.setFieldsValue({
      firstName: lead.firstName ?? '',
      lastName:  lead.lastName  ?? '',
      phone:     lead.phone     ?? '',
      email:     lead.email     ?? '',
    })
    setConvertOpen(true)
  }

  async function handleConvert() {
    const values = await convertForm.validateFields()
    setConverting(true)
    try {
      await leadsApi.convert(convertLead.id, values)
      message.success('Лид конвертирован в студента')
      setConvertOpen(false)
      load()
    } catch (e) {
      message.error(getErrorMessage(e))
    } finally {
      setConverting(false)
    }
  }

  const columns = [
    {
      title: 'Имя',
      key: 'name',
      render: (_, r) => `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim() || '—',
    },
    { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true },
    { title: 'Телефон', dataIndex: 'phone', key: 'phone', width: 140 },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (status, record) =>
        canEdit ? (
          <Select
            value={status}
            size="small"
            style={{ width: 150 }}
            options={STATUSES}
            onChange={(s) => handleStatusChange(record.id, s)}
          />
        ) : (
          <StatusBadge type="lead" value={status} />
        ),
    },
    {
      title: 'Курс',
      key: 'interestedCourse',
      render: (_, record) => record.interestedCourse?.title ?? '—',
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          {canEdit && (
            <Tooltip title="Редактировать">
              <Button type="text" icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
            </Tooltip>
          )}
          <Tooltip title="Комментарии">
            <Button type="text" icon={<CommentOutlined />} size="small" onClick={() => openComments(record)} />
          </Tooltip>
          {canEdit && record.status !== 'CONVERTED' && (
            <Tooltip title="Конвертировать в студента">
              <Button type="text" icon={<SwapOutlined />} size="small" onClick={() => openConvert(record)} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Лиды"
        subtitle="Управление потенциальными студентами"
        extra={
          <Space>
            <Select
              style={{ width: 180 }}
              options={STATUS_FILTER_OPTIONS}
              value={filterStatus ?? ''}
              onChange={(v) => setFilterStatus(v || null)}
              suffixIcon={<FilterOutlined />}
            />
            {canEdit && (
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                Добавить лид
              </Button>
            )}
          </Space>
        }
      />

      <Table
        dataSource={leads}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20, showSizeChanger: false }}
        style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}
      />

      {/* Create / Edit modal */}
      <Modal
        title={editing ? 'Редактировать лид' : 'Новый лид'}
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
          <Form.Item label="Интересующий курс" name="interestedCourseId">
            <Select
              placeholder="Выберите курс"
              allowClear
              options={courses.map(c => ({ value: c.id, label: c.title }))}
            />
          </Form.Item>
          <Form.Item label="Источник" name="source">
            <Input placeholder="Instagram, рекомендация..." />
          </Form.Item>
          <Form.Item label="Заметки" name="notes">
            <TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Comments drawer */}
      <Drawer
        title={`Комментарии — ${activeLead?.firstName ?? ''} ${activeLead?.lastName ?? ''}`}
        placement="right"
        width={420}
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
      >
        {comments.length === 0 ? (
          <Empty description="Комментариев пока нет" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <List
            dataSource={comments}
            renderItem={(c) => (
              <List.Item style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <Text>{c.text}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {c.author ? `${c.author.firstName} ${c.author.lastName}` : (c.authorName ?? '')} · {c.createdAt ? formatDateTime(c.createdAt) : ''}
                </Text>
              </List.Item>
            )}
          />
        )}
        <Divider />
        <div className="flex gap-2">
          <TextArea
            rows={2}
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Напишите комментарий..."
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            onClick={sendComment}
            loading={sendingComment}
            disabled={!commentText.trim()}
          >
            Отправить
          </Button>
        </div>
      </Drawer>

      {/* Convert to student modal */}
      <Modal
        title="Конвертировать в студента"
        open={convertOpen}
        onOk={handleConvert}
        onCancel={() => setConvertOpen(false)}
        okText="Конвертировать"
        cancelText="Отмена"
        confirmLoading={converting}
        destroyOnClose
        width={480}
      >
        <p className="text-text-secondary mb-4">
          Проверьте данные студента и подтвердите конвертацию. Лид получит статус «Конвертирован».
        </p>
        <Form form={convertForm} layout="vertical">
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item
              label="Имя"
              name="firstName"
              rules={[{ required: true, message: 'Введите имя' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Фамилия"
              name="lastName"
              rules={[{ required: true, message: 'Введите фамилию' }]}
            >
              <Input />
            </Form.Item>
          </div>
          <Form.Item
            label="Телефон"
            name="phone"
            rules={[{ required: true, message: 'Введите телефон' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ type: 'email', message: 'Некорректный email' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
