import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, theme } from 'antd'
import ruRU from 'antd/locale/ru_RU'
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'
import './index.css'

const antdTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorBgBase:        '#0d1423',
    colorBgContainer:   '#162032',
    colorBgElevated:    '#1a2744',
    colorBgLayout:      '#0d1423',
    colorBorder:        '#1e2d45',
    colorBorderSecondary: '#1e2d45',
    colorText:          '#ffffff',
    colorTextSecondary: '#8096b0',
    colorTextTertiary:  '#4a607a',
    colorPrimary:       '#1677ff',
    colorSuccess:       '#52c41a',
    colorWarning:       '#faad14',
    colorError:         '#ff4d4f',
    colorInfo:          '#1677ff',
    borderRadius:       8,
    fontFamily:         "'Inter', system-ui, -apple-system, sans-serif",
  },
  components: {
    Layout: {
      siderBg:    '#1a2744',
      headerBg:   '#162032',
      bodyBg:     '#0d1423',
      triggerBg:  '#1e2d45',
    },
    Menu: {
      darkItemBg:         '#1a2744',
      darkSubMenuItemBg:  '#162032',
      darkItemSelectedBg: 'rgba(22, 119, 255, 0.2)',
    },
    Table: {
      headerBg:          '#1a2744',
      rowHoverBg:        '#1e2f50',
      borderColor:       '#1e2d45',
    },
    Card: {
      colorBgContainer: '#162032',
    },
    Modal: {
      contentBg:  '#162032',
      headerBg:   '#162032',
      footerBg:   '#162032',
    },
    Drawer: {
      colorBgElevated: '#162032',
    },
  },
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider theme={antdTheme} locale={ruRU}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ConfigProvider>
  </StrictMode>,
)
