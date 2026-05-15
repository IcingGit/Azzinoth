import { useState, useEffect } from 'react'
import {
  Card, Table, Button, Modal, Form, Input, Select, InputNumber, Switch,
  Space, Tabs, Tag, message, Popconfirm,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import StatusBadge from '../components/StatusBadge'
import { alertApi } from '../api'

const { TextArea } = Input

function AlertManagement() {
  const [activeTab, setActiveTab] = useState('rules')
  const [rules, setRules] = useState([])
  const [records, setRecords] = useState([])
  const [rulesLoading, setRulesLoading] = useState(false)
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  const [form] = Form.useForm()
  const [recordsPagination, setRecordsPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  useEffect(() => {
    if (activeTab === 'rules') fetchRules()
    else fetchRecords()
  }, [activeTab, recordsPagination.current])

  const fetchRules = async () => {
    setRulesLoading(true)
    try {
      const res = await alertApi.getRules()
      setRules(res.data || [])
    } catch {
      message.error('获取告警规则失败')
    } finally {
      setRulesLoading(false)
    }
  }

  const fetchRecords = async () => {
    setRecordsLoading(true)
    try {
      const res = await alertApi.getRecords({
        page: recordsPagination.current,
        pageSize: recordsPagination.pageSize,
      })
      const data = res.data || {}
      setRecords(data.list || [])
      setRecordsPagination((prev) => ({ ...prev, total: data.total || 0 }))
    } catch {
      message.error('获取告警记录失败')
    } finally {
      setRecordsLoading(false)
    }
  }

  const handleAddRule = () => {
    setEditingRule(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEditRule = (rule) => {
    setEditingRule(rule)
    form.setFieldsValue(rule)
    setModalVisible(true)
  }

  const handleDeleteRule = async (id) => {
    try {
      await alertApi.deleteRule(id)
      message.success('删除成功')
      fetchRules()
    } catch {
      message.error('删除失败')
    }
  }

  const handleToggleRule = async (id, enabled) => {
    try {
      await alertApi.toggleRule(id, enabled)
      message.success('更新成功')
      fetchRules()
    } catch {
      message.error('更新失败')
    }
  }

  const handleSubmitRule = async () => {
    try {
      const values = await form.validateFields()
      if (editingRule) {
        await alertApi.updateRule(editingRule.id, values)
        message.success('更新成功')
      } else {
        await alertApi.createRule(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchRules()
    } catch (err) {
      if (err.errorFields) return
      message.error('操作失败')
    }
  }

  const handleAcknowledge = async (id) => {
    try {
      await alertApi.acknowledgeRecord(id)
      message.success('已确认')
      fetchRecords()
    } catch {
      message.error('操作失败')
    }
  }

  const handleResolve = async (id) => {
    try {
      await alertApi.resolveRecord(id)
      message.success('已解决')
      fetchRecords()
    } catch {
      message.error('操作失败')
    }
  }

  const metricTypeOptions = [
    { label: 'CPU使用率', value: 'cpu_usage' },
    { label: '内存使用率', value: 'memory_usage' },
    { label: '磁盘使用率', value: 'disk_usage' },
    { label: '网络流量', value: 'network_traffic' },
  ]

  const conditionOptions = [
    { label: '大于', value: 'gt' },
    { label: '大于等于', value: 'gte' },
    { label: '小于', value: 'lt' },
    { label: '小于等于', value: 'lte' },
    { label: '等于', value: 'eq' },
  ]

  const levelOptions = [
    { label: '信息', value: 'info' },
    { label: '警告', value: 'warning' },
    { label: '严重', value: 'critical' },
  ]

  const levelColorMap = {
    info: '#1890ff',
    warning: '#fd7e14',
    critical: '#dc3545',
  }

  const ruleColumns = [
    { title: '规则名称', dataIndex: 'name', key: 'name', width: 160 },
    {
      title: '指标类型',
      dataIndex: 'metricType',
      key: 'metricType',
      width: 120,
      render: (val) => {
        const item = metricTypeOptions.find((o) => o.value === val)
        return item ? item.label : val
      },
    },
    {
      title: '条件',
      dataIndex: 'condition',
      key: 'condition',
      width: 100,
      render: (val) => {
        const item = conditionOptions.find((o) => o.value === val)
        return item ? item.label : val
      },
    },
    {
      title: '阈值',
      dataIndex: 'threshold',
      key: 'threshold',
      width: 100,
      render: (val) => (val != null ? `${val}%` : '-'),
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 90,
      render: (val) => (
        <Tag color={levelColorMap[val] || '#999'}>
          {levelOptions.find((o) => o.value === val)?.label || val}
        </Tag>
      ),
    },
    {
      title: '启用',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 90,
      render: (val, record) => (
        <Switch
          checked={val}
          onChange={(checked) => handleToggleRule(record.id, checked)}
          size="small"
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEditRule(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDeleteRule(record.id)}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const recordColumns = [
    { title: '设备名称', dataIndex: 'deviceName', key: 'deviceName', width: 140 },
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
      render: (val) => (val != null ? `${val}%` : '-'),
    },
    {
      title: '阈值',
      dataIndex: 'threshold',
      key: 'threshold',
      width: 100,
      render: (val) => (val != null ? `${val}%` : '-'),
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 90,
      render: (val) => (
        <Tag color={levelColorMap[val] || '#999'}>
          {levelOptions.find((o) => o.value === val)?.label || val}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => <StatusBadge status={status} />,
    },
    { title: '时间', dataIndex: 'time', key: 'time', width: 170 },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_, record) => {
        if (record.status === 'resolved') return <span style={{ color: '#999' }}>已处理</span>
        return (
          <Space>
            {record.status === 'pending' && (
              <Button type="link" size="small" onClick={() => handleAcknowledge(record.id)}>
                确认
              </Button>
            )}
            <Button type="link" size="small" onClick={() => handleResolve(record.id)}>
              解决
            </Button>
          </Space>
        )
      },
    },
  ]

  return (
    <div className="page-container">
      <Card bordered={false}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'rules',
              label: '告警规则',
              children: (
                <>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddRule}
                    style={{ marginBottom: 16 }}
                  >
                    新增规则
                  </Button>
                  <Table
                    columns={ruleColumns}
                    dataSource={rules}
                    rowKey="id"
                    loading={rulesLoading}
                    pagination={false}
                    size="middle"
                  />
                </>
              ),
            },
            {
              key: 'records',
              label: '告警记录',
              children: (
                <Table
                  columns={recordColumns}
                  dataSource={records}
                  rowKey="id"
                  loading={recordsLoading}
                  pagination={{
                    current: recordsPagination.current,
                    pageSize: recordsPagination.pageSize,
                    total: recordsPagination.total,
                    showTotal: (total) => `共 ${total} 条记录`,
                  }}
                  onChange={(pag) =>
                    setRecordsPagination({
                      current: pag.current,
                      pageSize: pag.pageSize,
                      total: pag.total,
                    })
                  }
                  size="middle"
                />
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={editingRule ? '编辑告警规则' : '新增告警规则'}
        open={modalVisible}
        onOk={handleSubmitRule}
        onCancel={() => setModalVisible(false)}
        width={520}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="name"
            label="规则名称"
            rules={[{ required: true, message: '请输入规则名称' }]}
          >
            <Input placeholder="请输入规则名称" />
          </Form.Item>
          <Form.Item
            name="metricType"
            label="指标类型"
            rules={[{ required: true, message: '请选择指标类型' }]}
          >
            <Select placeholder="请选择指标类型" options={metricTypeOptions} />
          </Form.Item>
          <Space style={{ width: '100%' }} size="middle">
            <Form.Item
              name="condition"
              label="条件"
              rules={[{ required: true, message: '请选择条件' }]}
              style={{ width: 200 }}
            >
              <Select placeholder="请选择条件" options={conditionOptions} />
            </Form.Item>
            <Form.Item
              name="threshold"
              label="阈值(%)"
              rules={[{ required: true, message: '请输入阈值' }]}
              style={{ width: 200 }}
            >
              <InputNumber min={0} max={100} placeholder="0-100" style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item
            name="level"
            label="告警级别"
            rules={[{ required: true, message: '请选择告警级别' }]}
          >
            <Select placeholder="请选择告警级别" options={levelOptions} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="请输入规则描述" />
          </Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AlertManagement
