import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'userId',
    label: '申请人ID(关联系统用户表)',
  },
  {
    component: 'Select',
    componentProps: {},
    fieldName: 'leaveType',
    label: '请假类型(如:事假,病假,年假,婚假)',
  },
  {
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    fieldName: 'startTime',
    label: '请假开始时间(精确到时分)',
  },
  {
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    fieldName: 'endTime',
    label: '请假结束时间(精确到时分)',
  },
  {
    component: 'Input',
    fieldName: 'leaveDays',
    label: '请假天数(自动计算,支持0.5天粒度)',
  },
  {
    component: 'Textarea',
    fieldName: 'reason',
    label: '请假事由',
  },
  {
    component: 'Input',
    fieldName: 'attachmentUrl',
    label: '附件链接(如病假证明、休假凭证)',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      optionType: 'button',
    },
    fieldName: 'approvalStatus',
    label: '审批状态(字典: 待审批, 已批准, 已驳回)',
  },
  {
    component: 'Input',
    fieldName: 'approvedBy',
    label: '审批人ID(关联系统用户表,审批后生效)',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      optionType: 'button',
    },
    fieldName: 'status',
    label: '数据状态(0正常1停用/作废)',
  },
];

// 需要使用i18n注意这里要改成getter形式 否则切换语言不会刷新
// export const columns: () => VxeGridProps['columns'] = () => [
export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '申请 ID',
    field: 'id',
  },
  {
    title: '申请人ID(关联系统用户表)',
    field: 'userId',
  },
  {
    title: '请假类型(如:事假,病假,年假,婚假)',
    field: 'leaveType',
  },
  {
    title: '请假开始时间(精确到时分)',
    field: 'startTime',
  },
  {
    title: '请假结束时间(精确到时分)',
    field: 'endTime',
  },
  {
    title: '请假天数(自动计算,支持0.5天粒度)',
    field: 'leaveDays',
  },
  {
    title: '请假事由',
    field: 'reason',
  },
  {
    title: '附件链接(如病假证明、休假凭证)',
    field: 'attachmentUrl',
  },
  {
    title: '审批状态(字典: 待审批, 已批准, 已驳回)',
    field: 'approvalStatus',
  },
  {
    title: '审批人ID(关联系统用户表,审批后生效)',
    field: 'approvedBy',
  },
  {
    title: '数据状态(0正常1停用/作废)',
    field: 'status',
  },
  {
    title: '备注(如审批意见、特殊说明)',
    field: 'remark',
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    width: 180,
  },
];
