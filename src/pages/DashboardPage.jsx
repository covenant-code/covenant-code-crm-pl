import { useEffect, useState } from 'react'
import { Card, Col, Row, Statistic, Spin } from 'antd'
import {
  TeamOutlined,
  BookOutlined,
  UserAddOutlined,
  UsergroupAddOutlined,
  CalendarOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons'
import { studentsApi } from '../api/students'
import { coursesApi }  from '../api/courses'
import { leadsApi }    from '../api/leads'
import { groupsApi }   from '../api/groups'
import { lessonsApi }  from '../api/lessons'
import { PageHeader }  from '../components/common/PageHeader'

function StatCard({ title, value, icon, color, loading }) {
  return (
    <Card
      style={{
        background:   'var(--color-surface)',
        borderColor:  'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div className="flex items-center justify-between">
        <Statistic
          title={<span className="text-text-secondary">{title}</span>}
          value={loading ? '—' : value}
          valueStyle={{ color: 'var(--color-text-primary)', fontSize: '1.75rem' }}
        />
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
          style={{ background: `${color}26`, color }}
        >
          {icon}
        </div>
      </div>
    </Card>
  )
}

export default function DashboardPage() {
  const [stats, setStats]     = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [students, courses, leads, groups, lessons] = await Promise.allSettled([
          studentsApi.getAll({ size: 1 }),
          coursesApi.getAll({ size: 1 }),
          leadsApi.getAll({ size: 1 }),
          groupsApi.getAll({ size: 1 }),
          lessonsApi.getAll({ size: 1 }),
        ])

        setStats({
          students: students.status === 'fulfilled' ? (students.value.totalElements ?? students.value.length ?? 0) : '—',
          courses:  courses.status  === 'fulfilled' ? (courses.value.totalElements  ?? courses.value.length  ?? 0) : '—',
          leads:    leads.status    === 'fulfilled' ? (leads.value.totalElements    ?? leads.value.length    ?? 0) : '—',
          groups:   groups.status   === 'fulfilled' ? (groups.value.totalElements   ?? groups.value.length   ?? 0) : '—',
          lessons:  lessons.status  === 'fulfilled' ? (lessons.value.totalElements  ?? lessons.value.length  ?? 0) : '—',
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      <PageHeader
        title="Дашборд"
        subtitle="Общая статистика системы"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Студенты"
            value={stats.students}
            icon={<TeamOutlined />}
            color="#1677ff"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Курсы"
            value={stats.courses}
            icon={<BookOutlined />}
            color="#52c41a"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Лиды"
            value={stats.leads}
            icon={<UserAddOutlined />}
            color="#fa8c16"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Группы"
            value={stats.groups}
            icon={<UsergroupAddOutlined />}
            color="#7c3aed"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Занятия"
            value={stats.lessons}
            icon={<CalendarOutlined />}
            color="#13c2c2"
            loading={loading}
          />
        </Col>
      </Row>
    </div>
  )
}
