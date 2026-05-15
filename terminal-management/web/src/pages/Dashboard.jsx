import { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Spin, message } from 'antd'
import {
  DesktopOutlined,
  PoweroffOutlined,
  AlertOutlined,
  DashboardOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { dashboardApi } from '../api'

function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ onlineCount: 0, offlineCount: 0, alertCount: 0, avgCpu: 0 })
  const [trendData, setTrendData] = useState({ times: [], cpu: [], memory: [], disk: [] })
  const [recentAlerts, setRecentAlerts] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [statsRes, trendRes, alertsRes] = await Promise.allSettled([
        dashboardApi.getStats(),
        dashboardApi.getResourceTrend({ hours: 24 }),
        dashboardApi.getRecentAlerts({ limit: 10 }),
      ])

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data || stats)
      }
      if (trendRes.status === 'fulfilled') {
        setTrendData(trendRes.value.data || trendData)
      }
      if (alertsRes.status === 'fulfilled') {
        setRecentAlerts(alertsRes.value.data || [])
      }
    } catch {
      message.error('获取仪表盘数据失败')
    } finally {
      setLoading(false)
    }
  }

  const trendChartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: {
      data: ['CPU使用率', '内存使用率', '磁盘使用率'],
      top: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendData.times,
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%' },
    },
    series: [
      {
        name: 'CPU使用率',
        type: 'line',
        smooth: true,
        data: trendData.cpu,
        itemStyle: { color: '#1e3a5f' },
        areaStyle: { color: 'rgba(30,58,95,0.1)' },
      },
      {
        name: '内存使用率',
        type: 'line',
        smooth: true,
        data: trendData.memory,
        itemStyle: { color: '#28a745' },
        areaStyle: { color: 'rgba(40,167,69,0.1)' },
      },
      {
        name: '磁盘使用率',
        type: 'line',
        smooth: true,
        data: trendData.disk,
        itemStyle: { color: '#fd7e14' },
        areaStyle: { color: 'rgba(253,126,20,0.1)' },
      },
    ],
  }

  const alertColumns = [
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 140,
    },
    {
      title: '告警类型',
      dataIndex: 'alertType',
      key: 'alertType',
      width: 120,
    },
    {
      title: '当前值',
      dataIndex: 'currentValue',
      key: 'currentValue',
      width: 100,
      render: (val) => val != null ? `${val}%` : '-',
    },
    {
      title: '阈值',
      dataIndex: 'threshold',
      key: 'threshold',
      width: 100,
      render: (val) => val != null ? `${val}%` : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: 160,
    },
  ]

  return (
    <div className="page-container">
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="在线设备"
              value={stats.onlineCount}
              icon={<DesktopOutlined />}
              color="green"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="离线设备"
              value={stats.offlineCount}
              icon={<PoweroffOutlined />}
              color="red"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="活跃告警"
              value={stats.alertCount}
              icon={<AlertOutlined />}
              color="orange"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="平均CPU"
              value={stats.avgCpu}
              icon={<DashboardOutlined />}
              color="blue"
              suffix="%"
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="资源使用趋势（24小时）" bordered={false}>
              <ReactECharts
                option={trendChartOption}
                style={{ height: 350 }}
                notMerge={true}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="最近告警" bordered={false}>
              <Table
                columns={alertColumns}
                dataSource={recentAlerts}
                rowKey="id"
                pagination={false}
                size="middle"
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  )
}

export default Dashboard
