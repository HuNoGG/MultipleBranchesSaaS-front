import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'userId',
    label: '员工 ID',
  },
  {
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    fieldName: 'payPeriodStart',
    label: '薪资周期开始',
  },
  {
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    fieldName: 'payPeriodEnd',
    label: '薪资周期结束',
  },
  {
    component: 'Input',
    fieldName: 'totalHours',
    label: '总工时',
  },
  {
    component: 'Input',
    fieldName: 'basePay',
    label: '基本薪资',
  },
  {
    component: 'Input',
    fieldName: 'overtimePay',
    label: '加班费',
  },
  {
    component: 'Input',
    fieldName: 'deductions',
    label: '扣款',
  },
  {
    component: 'Input',
    fieldName: 'finalSalary',
    label: '最终薪资',
  },
  {
    component: 'Input',
    fieldName: 'isFinalized',
    label: '是否已确认',
  },
];

// 需要使用i18n注意这里要改成getter形式 否则切换语言不会刷新
// export const columns: () => VxeGridProps['columns'] = () => [
export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '薪资单 ID',
    field: 'id',
  },
  {
    title: '员工 ID',
    field: 'userId',
  },
  {
    title: '薪资周期开始',
    field: 'payPeriodStart',
  },
  {
    title: '薪资周期结束',
    field: 'payPeriodEnd',
  },
  {
    title: '总工时',
    field: 'totalHours',
  },
  {
    title: '基本薪资',
    field: 'basePay',
  },
  {
    title: '加班费',
    field: 'overtimePay',
  },
  {
    title: '扣款',
    field: 'deductions',
  },
  {
    title: '最终薪资',
    field: 'finalSalary',
  },
  {
    title: '是否已确认',
    field: 'isFinalized',
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
