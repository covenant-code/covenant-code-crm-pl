import { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Typography } from 'antd'
import {
  DashboardOutlined,
  BookOutlined,
  UserAddOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  CalendarOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROLE_LABELS, isAdmin, canManageContent } from '../utils/roles'

const { Sider, Header, Content } = Layout
const { Text } = Typography

function buildMenuItems(role) {
  const items = [
    { key: '/',         icon: <DashboardOutlined />, label: 'Дашборд' },
    { key: '/courses',  icon: <BookOutlined />,       label: 'Курсы' },
    { key: '/leads',    icon: <UserAddOutlined />,    label: 'Лиды' },
    { key: '/students', icon: <UserOutlined />,       label: 'Студенты' },
    { key: '/groups',   icon: <UsergroupAddOutlined />, label: 'Группы' },
    { key: '/lessons',  icon: <CalendarOutlined />,   label: 'Занятия' },
  ]

  if (canManageContent(role)) {
    items.push({ key: '/teachers', icon: <TeamOutlined />, label: 'Преподаватели' })
  }
  if (isAdmin(role)) {
    items.push({ key: '/users', icon: <UserOutlined />, label: 'Пользователи' })
  }

  return items
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { auth, logout }          = useAuth()
  const navigate                  = useNavigate()
  const location                  = useLocation()

  const menuItems  = buildMenuItems(auth?.role)
  const activeKey  = menuItems.find(i => i.key !== '/' && location.pathname.startsWith(i.key))?.key
                     ?? (location.pathname === '/' ? '/' : undefined)

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выйти',
      danger: true,
      onClick: () => { logout(); navigate('/login') },
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={200}
        style={{ position: 'fixed', insetInlineStart: 0, top: 0, bottom: 0, zIndex: 100 }}
      >
        <div
          className="flex items-center gap-2 px-4 h-14 border-b border-border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {!collapsed && (
            <Text strong className="text-text-primary truncate text-sm">
              CRM Bootcamp
            </Text>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderInlineEnd: 'none', flex: 1 }}
        />
      </Sider>

      <Layout style={{ marginInlineStart: collapsed ? 80 : 200, transition: 'margin 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-text-secondary hover:text-text-primary transition-colors text-lg bg-transparent border-none cursor-pointer"
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar size="small" style={{ backgroundColor: '#1677ff' }}>
                {auth?.firstName?.[0]?.toUpperCase() ?? 'U'}
              </Avatar>
              <span className="text-sm text-text-secondary hidden sm:inline">
                {auth?.firstName} {auth?.lastName}
              </span>
              {auth?.role && (
                <span className="text-xs text-text-muted hidden md:inline">
                  · {ROLE_LABELS[auth.role]}
                </span>
              )}
            </div>
          </Dropdown>
        </Header>

        <Content style={{ padding: 24, minHeight: 'calc(100vh - 56px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
