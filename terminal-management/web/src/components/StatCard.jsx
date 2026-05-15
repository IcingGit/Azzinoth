import { Card } from 'antd'

const colorMap = {
  blue: { bg: '#e6f0fa', border: '#1e3a5f', text: '#1e3a5f' },
  green: { bg: '#e8f5e9', border: '#28a745', text: '#28a745' },
  orange: { bg: '#fff3e0', border: '#fd7e14', text: '#fd7e14' },
  red: { bg: '#fde8e8', border: '#dc3545', text: '#dc3545' },
}

function StatCard({ title, value, icon, color = 'blue', suffix = '' }) {
  const colors = colorMap[color] || colorMap.blue

  return (
    <Card
      className="stat-card"
      style={{ borderTop: `3px solid ${colors.border}` }}
      bodyStyle={{ padding: 20 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 8 }}>{title}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: colors.text }}>
            {value}
            {suffix && <span style={{ fontSize: 14, marginLeft: 2 }}>{suffix}</span>}
          </div>
        </div>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: colors.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            color: colors.border,
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  )
}

export default StatCard
