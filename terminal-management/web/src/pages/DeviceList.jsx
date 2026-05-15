import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Input, Select, Card, Space, Tag, Progress, message } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import StatusBadge from '../components/StatusBadge'
import { deviceApi } from '../api'

const { Search } = Input

function DeviceList() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [devices, setDevices] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchDevices()
  }, [pagination.current, pagination.pageSize, statusFilter])

  const fetchDevices = async () => {
    setLoading(true)
    try {
      const res = await deviceApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchText,
        status: statusFilter,
      })
      const data = res.data || {}
      setDevices(data.list || [])
      setPagination((prev) => ({
        ...prev,
        total: data.total || 0,
      }))
    } catch {
      message.error('获取设备列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value) => {
    setSearchText(value)
    setPagination((prev) => ({ ...prev, current: 1 }))
    setTimeout(() => fetchDevices(), 0)
  }

  const handleStatusFilter = (value) => {
    setStatusFilter(value)
    setPagination((prev) => ({ ...prev, current: 1 }))
  }

  const handleTableChange = (pag) => {
    setPagination({
      current: pag.current,
      pageSize: pag.pageSize,
      total: pag.total,
    })
  }

  const columns = [
    {
      title: '设备名称',
      dataIndex: 'hostname',
      key: 'hostname',
      width: 160,
      render: (text, record) => (
        <a onClick={() => navigate(`/devices/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 140,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: 'CPU使用率',
      dataIndex: 'cpuUsage',
      key: 'cpuUsage',
      width: 180,
      render: (val) => {
        const v = val || 0
        const color = v > 80 ? '#dc3545' : v > 60 ? '#fd7e14' : '#28a745'
        return <Progress percent={v} strokeColor={color} size="small" />
      },
    },
    {
      title: '内存使用率',
      dataIndex: 'memoryUsage',
      key: 'memoryUsage',
      width: 180,
      render: (val) => {
        const v = val || 0
        const color = v > 80 ? '#dc3545' : v > 60 ? '#fd7e14' : '#28a745'
        return <Progress percent={v} strokeColor={color} size="small" />
      },
    },
    {
      title: '最后上报时间',
      dataIndex: 'lastReportTime',
      key: 'lastReportTime',
      width: 180,
    },
  ]

  return (
    <div className="page-container">
      <Card bordered={false}>
        <Space style={{ marginBottom: 16 }} size="middle">
          <Search
            placeholder="搜索设备名称或IP"
            allowClear
            onSearch={handleSearch}
            style={{ width: 280 }}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="状态筛选"
            allowClear
            style={{ width: 140 }}
            onChange={handleStatusFilter}
            value={statusFilter || undefined}
            options={[
              { label: '在线', value: 'online' },
              { label: '离线', value: 'offline' },
              { label: '告警', value: 'warning' },
            ]}
          />
        </Space>
        <Table
          columns={columns}
          dataSource={devices}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 台设备`,
          }}
          onChange={handleTableChange}
          onRow={(record) => ({
            onClick: () => navigate(`/devices/${record.id}`),
          })}
        />
      </Card>
    </div>
  )
}

export default DeviceList
