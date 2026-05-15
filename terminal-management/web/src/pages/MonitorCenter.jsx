import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, Select, Row, Col, Space, Button, message, Statistic } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { monitorApi, deviceApi } from '../api'

function MonitorCenter() {
  const [devices, setDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [historyData, setHistoryData] = useState({ times: [], cpu: [], memory: [], disk: [] })
  const [realtimeData, setRealtimeData] = useState({ cpu: 0, memory: 0, disk: 0 })
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const timerRef = useRef(null)

  useEffect(() => {
    fetchDeviceList()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (selectedDevice) {
      fetchHistoryData(selectedDevice)
      startRealtimeRefresh(selectedDevice)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [selectedDevice])

  const fetchDeviceList = async () => {
    try {
      const res = await deviceApi.getList({ pageSize: 1000 })
      const list = res.data?.list || []
      setDevices(list)
      if (list.length > 0 && !selectedDevice) {
        setSelectedDevice(list[0].id)
      }
    } catch {
      message.error('获取设备列表失败')
    }
  }

  const fetchHistoryData = async (deviceId) => {
    setLoading(true)
    try {
      const res = await monitorApi.getHistory(deviceId, { hours: 6 })
      setHistoryData(res.data || { times: [], cpu: [], memory: [], disk: [] })
    } catch {
      message.error('获取历史数据失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchRealtimeData = async (deviceId) => {
    try {
      const res = await monitorApi.getRealtime(deviceId)
      setRealtimeData(res.data || { cpu: 0, memory: 0, disk: 0 })
    } catch {
      // silently fail for realtime polling
    }
  }

  const startRealtimeRefresh = useCallback((deviceId) => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (!autoRefresh) return

    fetchRealtimeData(deviceId)
    timerRef.current = setInterval(() => {
      fetchRealtimeData(deviceId)
    }, 5000)
  }, [autoRefresh])

  useEffect(() => {
    if (selectedDevice) {
      startRealtimeRefresh(selectedDevice)
    }
  }, [autoRefresh])

  const handleRefresh = () => {
    if (selectedDevice) {
      fetchHistoryData(selectedDevice)
      fetchRealtimeData(selectedDevice)
    }
  }

  const cpuChartOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { data: ['CPU使用率'], top: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: historyData.times,
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
        data: historyData.cpu,
        itemStyle: { color: '#1e3a5f' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(30,58,95,0.3)' },
              { offset: 1, color: 'rgba(30,58,95,0.02)' },
            ],
          },
        },
        markLine: {
          silent: true,
          data: [{ yAxis: 80, lineStyle: { color: '#dc3545', type: 'dashed' } }],
          label: { formatter: '告警线 80%' },
        },
      },
    ],
  }

  const memoryChartOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { data: ['内存使用率'], top: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: historyData.times,
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%' },
    },
    series: [
      {
        name: '内存使用率',
        type: 'line',
        smooth: true,
        data: historyData.memory,
        itemStyle: { color: '#28a745' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(40,167,69,0.3)' },
              { offset: 1, color: 'rgba(40,167,69,0.02)' },
            ],
          },
        },
        markLine: {
          silent: true,
          data: [{ yAxis: 80, lineStyle: { color: '#dc3545', type: 'dashed' } }],
          label: { formatter: '告警线 80%' },
        },
      },
    ],
  }

  const diskChartOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { data: ['磁盘使用率'], top: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: historyData.times,
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%' },
    },
    series: [
      {
        name: '磁盘使用率',
        type: 'line',
        smooth: true,
        data: historyData.disk,
        itemStyle: { color: '#fd7e14' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(253,126,20,0.3)' },
              { offset: 1, color: 'rgba(253,126,20,0.02)' },
            ],
          },
        },
        markLine: {
          silent: true,
          data: [{ yAxis: 80, lineStyle: { color: '#dc3545', type: 'dashed' } }],
          label: { formatter: '告警线 80%' },
        },
      },
    ],
  }

  const getValueColor = (val) => {
    if (val > 80) return '#dc3545'
    if (val > 60) return '#fd7e14'
    return '#28a745'
  }

  return (
    <div className="page-container">
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Space size="middle" wrap>
          <span style={{ fontWeight: 500 }}>选择设备：</span>
          <Select
            style={{ width: 260 }}
            placeholder="请选择设备"
            value={selectedDevice}
            onChange={setSelectedDevice}
            showSearch
            optionFilterProp="label"
            options={devices.map((d) => ({
              label: `${d.hostname} (${d.ip})`,
              value: d.id,
            }))}
          />
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
          <span>
            自动刷新：
            <Select
              size="small"
              value={autoRefresh ? 'on' : 'off'}
              onChange={(val) => setAutoRefresh(val === 'on')}
              style={{ width: 80, marginLeft: 8 }}
              options={[
                { label: '开启', value: 'on' },
                { label: '关闭', value: 'off' },
              ]}
            />
          </span>
        </Space>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic
              title="CPU使用率"
              value={realtimeData.cpu}
              suffix="%"
              valueStyle={{ color: getValueColor(realtimeData.cpu), fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic
              title="内存使用率"
              value={realtimeData.memory}
              suffix="%"
              valueStyle={{ color: getValueColor(realtimeData.memory), fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic
              title="磁盘使用率"
              value={realtimeData.disk}
              suffix="%"
              valueStyle={{ color: getValueColor(realtimeData.disk), fontSize: 28 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="CPU历史趋势（6小时）" bordered={false} loading={loading}>
            <ReactECharts option={cpuChartOption} style={{ height: 280 }} notMerge={true} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="内存历史趋势（6小时）" bordered={false} loading={loading}>
            <ReactECharts option={memoryChartOption} style={{ height: 280 }} notMerge={true} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="磁盘历史趋势（6小时）" bordered={false} loading={loading}>
            <ReactECharts option={diskChartOption} style={{ height: 280 }} notMerge={true} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default MonitorCenter
