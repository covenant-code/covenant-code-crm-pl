import { useState } from 'react'
import { Layout, Menu } from 'antd'
import { DashboardOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'

const { Header, Sider, Content } = Layout

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
]

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Layout className="min-h-screen">
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} trigger={null}>
        <div className="h-8 m-4 bg-white/10 rounded flex items-center justify-center">
          {!collapsed && <span className="text-white font-semibold text-sm">CRM Bootcamp</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        <Header className="bg-white px-4 flex items-center gap-3 shadow-sm">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg text-gray-600 hover:text-blue-500 transition-colors"
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
        </Header>

        <Content className="m-6">
          <div className="bg-white rounded-lg p-6 min-h-full">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
