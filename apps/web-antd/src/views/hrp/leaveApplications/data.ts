import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'userId',
    label: '申请人ID',
  },
  {
    component: 'Select',
    componentProps: {},
    fieldName: 'leaveType',
    label: '请假类型',
  },
  {
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    fieldName: 'startTime',
    label: '请假开始时间',
  },
  {
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    fieldName: 'endTime',
    label: '请假结束时间',
  },
  {
    component: 'Input',
    fieldName: 'leaveDays',
    label: '请假天数',
  },
  {
    component: 'Textarea',
    fieldName: 'reason',
    label: '请假事由',
  },
  {
    component: 'Input',
    fieldName: 'attachmentUrl',
    label: '附件链接',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      optionType: 'button',
    },
    fieldName: 'approvalStatus',
    label: '审批状态',
  },
  {
    component: 'Input',
    fieldName: 'approvedBy',
    label: '审批人ID',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      optionType: 'button',
    },
    fieldName: 'status',
    label: '数据状态',
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
    title: '申请人ID',
    field: 'userId',
  },
  {
    title: '请假类型',
    field: 'leaveType',
  },
  {
    title: '请假开始时间',
    field: 'startTime',
  },
  {
    title: '请假结束时间',
    field: 'endTime',
  },
  {
    title: '请假天数',
    field: 'leaveDays',
  },
  {
    title: '请假事由',
    field: 'reason',
  },
  {
    title: '附件链接',
    field: 'attachmentUrl',
  },
  {
    title: '审批状态',
    field: 'approvalStatus',
  },
  {
    title: '审批人ID',
    field: 'approvedBy',
  },
  {
    title: '数据状态',
    field: 'status',
  },
  {
    title: '备注',
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
