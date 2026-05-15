import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout as AntLayout, Menu } from 'antd'
import {
  DashboardOutlined,
  DesktopOutlined,
  AlertOutlined,
  MonitorOutlined,
} from '@ant-design/icons'

const { Header, Sider, Content } = AntLayout

const menuItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '仪表盘',
  },
  {
    key: '/devices',
    icon: <DesktopOutlined />,
    label: '设备管理',
  },
  {
    key: '/alerts',
    icon: <AlertOutlined />,
    label: '告警管理',
  },
  {
    key: '/monitor',
    icon: <MonitorOutlined />,
    label: '监控中心',
  },
]

function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const selectedKey = '/' + location.pathname.split('/').filter(Boolean)[0]

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background: '#1e3a5f',
        }}
        theme="dark"
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? 16 : 20,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {collapsed ? 'TM' : '终端管理平台'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            background: '#1e3a5f',
            borderRight: 0,
          }}
        />
      </Sider>
      <AntLayout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            height: 64,
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 600, color: '#1e3a5f' }}>
            终端设备管理系统
          </span>
          <span style={{ color: '#666' }}>
            {new Date().toLocaleDateString('zh-CN')}
          </span>
        </Header>
        <Content
          style={{
            margin: 0,
            minHeight: 280,
            background: '#f0f2f5',
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout
