import { useEffect, useState, useCallback } from 'react'
import {
  Table, Button, Modal, Drawer, Form, Input, Select,
  Popconfirm, message, Space, Tooltip, List, Avatar,
  Typography, Empty, Tag,
} from 'antd'
import {
  PlusOutlined, EditOutlined, TeamOutlined, UserDeleteOutlined,
  UserAddOutlined,
} from '@ant-design/icons'
import { groupsApi }   from '../api/groups'
import { coursesApi }  from '../api/courses'
import { studentsApi } from '../api/students'
import { PageHeader }  from '../components/common/PageHeader'
import { StatusBadge } from '../components/common/StatusBadge'
import { useAuth }     from '../hooks/useAuth'
import { canManageContent } from '../utils/roles'
import { getErrorMessage, parseProblemDetail } from '../utils/errors'

const { Text } = Typography

const STATUSES = [
  { value: 'FORMING',   label: 'Набор' },
  { value: 'ACTIVE',    label: 'Активна' },
  { value: 'COMPLETED', label: 'Завершена' },
  { value: 'CANCELLED', label: 'Отменена' },
]

export default function GroupsPage() {
  const { auth }                        = useAuth()
  const canEdit                         = canManageContent(auth?.role)
  const [groups, setGroups]             = useState([])
  const [courses, setCourses]           = useState([])
  const [loading, setLoading]           = useState(false)
  const [modalOpen, setModalOpen]       = useState(false)
  const [editing, setEditing]           = useState(null)
  const [saving, setSaving]             = useState(false)
  const [form]                          = Form.useForm()

  const [membersOpen, setMembersOpen]   = useState(false)
  const [activeGroup, setActiveGroup]   = useState(null)
  const [members, setMembers]           = useState([])
  const [allStudents, setAllStudents]   = useState([])
  const [addStudentId, setAddStudentId] = useState(null)
  const [addingStudent, setAddingStudent] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [groupsData, coursesData] = await Promise.all([
        groupsApi.getAll(),
        coursesApi.getAll(),
      ])
      setGroups(Array.isArray(groupsData) ? groupsData : (groupsData.content ?? []))
      setCourses(Array.isArray(coursesData) ? coursesData : (coursesData.content ?? []))
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
    let values
    try { values = await form.validateFields() } catch { return }
    setSaving(true)
    try {
      if (editing) {
        await groupsApi.update(editing.id, values)
        message.success('Группа обновлена')
      } else {
        await groupsApi.create(values)
        message.success('Группа создана')
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

  async function handleStatusChange(id, status) {
    try {
      await groupsApi.updateStatus(id, status)
      load()
    } catch (e) {
      message.error(getErrorMessage(e))
    }
  }

  async function openMembers(group) {
    setActiveGroup(group)
    setMembersOpen(true)
    setAddStudentId(null)
    try {
      const [membersData, studentsData] = await Promise.all([
        groupsApi.getStudents(group.id),
        studentsApi.getAll(),
      ])
      setMembers(Array.isArray(membersData) ? membersData : [])
      setAllStudents(Array.isArray(studentsData) ? studentsData : (studentsData.content ?? []))
    } catch (e) {
      message.error(getErrorMessage(e))
    }
  }

  async function handleAddStudent() {
    if (!addStudentId) return
    setAddingStudent(true)
    try {
      await groupsApi.addStudent(activeGroup.id, addStudentId)
      const data = await groupsApi.getStudents(activeGroup.id)
      setMembers(Array.isArray(data) ? data : [])
      setAddStudentId(null)
      message.success('Студент добавлен в группу')
    } catch (e) {
      message.error(getErrorMessage(e))
    } finally {
      setAddingStudent(false)
    }
  }

  async function handleRemoveStudent(studentId) {
    try {
      await groupsApi.removeStudent(activeGroup.id, studentId)
      const data = await groupsApi.getStudents(activeGroup.id)
      setMembers(Array.isArray(data) ? data : [])
      message.success('Студент удалён из группы')
    } catch (e) {
      message.error(getErrorMessage(e))
    }
  }

  const memberIds        = new Set(members.map(m => m.id))
  const availableStudents = allStudents.filter(s => !memberIds.has(s.id))

  const columns = [
    { title: 'Название', dataIndex: 'name', key: 'name' },
    {
      title: 'Курс',
      dataIndex: 'courseId',
      key: 'courseId',
      render: (id) => courses.find(c => c.id === id)?.name ?? '—',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status, record) =>
        canEdit ? (
          <Select
            value={status}
            size="small"
            style={{ width: 140 }}
            options={STATUSES}
            onChange={(s) => handleStatusChange(record.id, s)}
          />
        ) : (
          <StatusBadge type="group" value={status} />
        ),
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      render: (_, record) => (
        <Space size="small">
          {canEdit && (
            <Tooltip title="Редактировать">
              <Button type="text" icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
            </Tooltip>
          )}
          <Tooltip title="Участники">
            <Button type="text" icon={<TeamOutlined />} size="small" onClick={() => openMembers(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Группы"
        subtitle="Управление учебными группами"
        extra={
          canEdit && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Создать группу
            </Button>
          )
        }
      />

      <Table
        dataSource={groups}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20, showSizeChanger: false }}
        style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}
      />

      <Modal
        title={editing ? 'Редактировать группу' : 'Новая группа'}
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
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input placeholder="Python — весна 2025" />
          </Form.Item>
          <Form.Item label="Курс" name="courseId">
            <Select
              placeholder="Выберите курс"
              allowClear
              options={courses.map(c => ({ value: c.id, label: c.name }))}
            />
          </Form.Item>
          <Form.Item label="Максимум студентов" name="maxStudents">
            <Input type="number" min={1} placeholder="15" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Members drawer */}
      <Drawer
        title={`Участники — ${activeGroup?.name ?? ''}`}
        placement="right"
        width={440}
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
      >
        {canEdit && (
          <div className="flex gap-2 mb-4">
            <Select
              placeholder="Добавить студента..."
              showSearch
              optionFilterProp="label"
              style={{ flex: 1 }}
              value={addStudentId}
              onChange={setAddStudentId}
              options={availableStudents.map(s => ({
                value: s.id,
                label: `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim(),
              }))}
            />
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={handleAddStudent}
              loading={addingStudent}
              disabled={!addStudentId}
            >
              Добавить
            </Button>
          </div>
        )}

        {members.length === 0 ? (
          <Empty description="В группе нет студентов" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <List
            dataSource={members}
            renderItem={(student) => (
              <List.Item
                actions={
                  canEdit
                    ? [
                        <Popconfirm
                          key="remove"
                          title="Убрать из группы?"
                          onConfirm={() => handleRemoveStudent(student.id)}
                          okText="Да"
                          cancelText="Нет"
                        >
                          <Button type="text" danger size="small" icon={<UserDeleteOutlined />} />
                        </Popconfirm>,
                      ]
                    : []
                }
              >
                <List.Item.Meta
                  avatar={
                    <Avatar style={{ backgroundColor: '#1677ff' }}>
                      {(student.firstName?.[0] ?? '?').toUpperCase()}
                    </Avatar>
                  }
                  title={`${student.firstName ?? ''} ${student.lastName ?? ''}`.trim()}
                  description={<Text type="secondary">{student.email}</Text>}
                />
              </List.Item>
            )}
          />
        )}
      </Drawer>
    </div>
  )
}
