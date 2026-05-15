import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Descriptions, Table, Spin, Button, Progress, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import StatusBadge from '../components/StatusBadge'
import { deviceApi } from '../api'

function DeviceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [device, setDevice] = useState({})
  const [hardware, setHardware] = useState({ cpu: {}, memory: {}, disks: [], usbDevices: [] })
  const [monitorData, setMonitorData] = useState({ times: [], cpu: [], memory: [], disk: [] })

  useEffect(() => {
    fetchDeviceDetail()
  }, [id])

  const fetchDeviceDetail = async () => {
    setLoading(true)
    try {
      const [detailRes, hwRes, monitorRes] = await Promise.allSettled([
        deviceApi.getDetail(id),
        deviceApi.getHardware(id),
        deviceApi.getMonitor(id, { hours: 1 }),
      ])

      if (detailRes.status === 'fulfilled') {
        setDevice(detailRes.value.data || {})
      }
      if (hwRes.status === 'fulfilled') {
        setHardware(hwRes.value.data || hardware)
      }
      if (monitorRes.status === 'fulfilled') {
        setMonitorData(monitorRes.value.data || monitorData)
      }
    } catch {
      message.error('获取设备详情失败')
    } finally {
      setLoading(false)
    }
  }

  const monitorChartOption = {
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
      data: monitorData.times,
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
        data: monitorData.cpu,
        itemStyle: { color: '#1e3a5f' },
        areaStyle: { color: 'rgba(30,58,95,0.1)' },
      },
      {
        name: '内存使用率',
        type: 'line',
        smooth: true,
        data: monitorData.memory,
        itemStyle: { color: '#28a745' },
        areaStyle: { color: 'rgba(40,167,69,0.1)' },
      },
      {
        name: '磁盘使用率',
        type: 'line',
        smooth: true,
        data: monitorData.disk,
        itemStyle: { color: '#fd7e14' },
        areaStyle: { color: 'rgba(253,126,20,0.1)' },
      },
    ],
  }

  const diskColumns = [
    { title: '设备', dataIndex: 'device', key: 'device', width: 120 },
    { title: '挂载点', dataIndex: 'mountPoint', key: 'mountPoint', width: 120 },
    { title: '总容量', dataIndex: 'total', key: 'total', width: 100 },
    { title: '已使用', dataIndex: 'used', key: 'used', width: 100 },
    { title: '可用', dataIndex: 'available', key: 'available', width: 100 },
    {
      title: '使用率',
      dataIndex: 'usagePercent',
      key: 'usagePercent',
      width: 160,
      render: (val) => {
        const v = val || 0
        const color = v > 80 ? '#dc3545' : v > 60 ? '#fd7e14' : '#28a745'
        return <Progress percent={v} strokeColor={color} size="small" />
      },
    },
  ]

  const usbColumns = [
    { title: '设备名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type', width: 120 },
    { title: '厂商', dataIndex: 'vendor', key: 'vendor', width: 160 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (s) => <StatusBadge status={s || 'online'} /> },
  ]

  return (
    <div className="page-container">
      <Spin spinning={loading}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/devices')}
          style={{ marginBottom: 16 }}
        >
          返回设备列表
        </Button>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="基本信息" bordered={false}>
              <Descriptions column={3} bordered size="middle">
                <Descriptions.Item label="主机名">{device.hostname || '-'}</Descriptions.Item>
                <Descriptions.Item label="IP地址">{device.ip || '-'}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <StatusBadge status={device.status || 'offline'} />
                </Descriptions.Item>
                <Descriptions.Item label="操作系统">{device.osVersion || '-'}</Descriptions.Item>
                <Descriptions.Item label="系统架构">{device.arch || '-'}</Descriptions.Item>
                <Descriptions.Item label="运行时间">{device.uptime || '-'}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="硬件信息" bordered={false}>
              <Descriptions column={2} bordered size="middle" style={{ marginBottom: 24 }}>
                <Descriptions.Item label="CPU型号">{hardware.cpu.model || '-'}</Descriptions.Item>
                <Descriptions.Item label="CPU核心数">{hardware.cpu.cores || '-'}</Descriptions.Item>
                <Descriptions.Item label="内存总量">{hardware.memory.total || '-'}</Descriptions.Item>
                <Descriptions.Item label="内存使用率">
                  {hardware.memory.usagePercent != null ? (
                    <Progress
                      percent={hardware.memory.usagePercent}
                      strokeColor={hardware.memory.usagePercent > 80 ? '#dc3545' : '#28a745'}
                      size="small"
                      style={{ maxWidth: 200 }}
                    />
                  ) : '-'}
                </Descriptions.Item>
              </Descriptions>

              <div className="section-title">磁盘列表</div>
              <Table
                columns={diskColumns}
                dataSource={hardware.disks}
                rowKey="device"
                pagination={false}
                size="small"
                style={{ marginBottom: 24 }}
              />

              <div className="section-title">USB设备列表</div>
              <Table
                columns={usbColumns}
                dataSource={hardware.usbDevices}
                rowKey={(r, i) => i}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="实时监控（最近1小时）" bordered={false}>
              <ReactECharts
                option={monitorChartOption}
                style={{ height: 350 }}
                notMerge={true}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  )
}

export default DeviceDetail
