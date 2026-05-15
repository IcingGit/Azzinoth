import { Tag } from 'antd'

const statusConfig = {
  online: { color: '#28a745', text: '在线' },
  offline: { color: '#dc3545', text: '离线' },
  warning: { color: '#fd7e14', text: '告警' },
  critical: { color: '#dc3545', text: '严重' },
  pending: { color: '#faad14', text: '待处理' },
  acknowledged: { color: '#1e3a5f', text: '已确认' },
  resolved: { color: '#28a745', text: '已解决' },
  info: { color: '#1890ff', text: '信息' },
}

function StatusBadge({ status }) {
  const config = statusConfig[status] || { color: '#999', text: status }

  return (
    <Tag
      color={config.color}
      style={{
        borderRadius: 4,
        fontWeight: 500,
        minWidth: 60,
        textAlign: 'center',
      }}
    >
      {config.text}
    </Tag>
  )
}

export default StatusBadge
