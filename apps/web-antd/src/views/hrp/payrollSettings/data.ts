import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'userId',
    label: '员工 ID',
  },
  {
    component: 'Input',
    fieldName: 'baseSalary',
    label: '月薪(全职适用)',
  },
  {
    component: 'Input',
    fieldName: 'hourlyRate',
    label: '时薪(计时适用)',
  },
  {
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    fieldName: 'effectiveDate',
    label: '生效日期',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      optionType: 'button',
    },
    fieldName: 'status',
    label: '状态(0正常1停用)',
  },
];

// 需要使用i18n注意这里要改成getter形式 否则切换语言不会刷新
// export const columns: () => VxeGridProps['columns'] = () => [
export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '规则 ID',
    field: 'id',
  },
  {
    title: '员工 ID',
    field: 'userId',
  },
  {
    title: '月薪(全职适用)',
    field: 'baseSalary',
  },
  {
    title: '时薪(计时适用)',
    field: 'hourlyRate',
  },
  {
    title: '生效日期',
    field: 'effectiveDate',
  },
  {
    title: '状态(0正常1停用)',
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

export const modalSchema: FormSchemaGetter = () => [
  {
    label: '规则 ID',
    fieldName: 'id',
    component: 'Input',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
  },
  {
    label: '员工 ID',
    fieldName: 'userId',
    component: 'Input',
    rules: 'required',
  },
  {
    label: '月薪(全职适用)',
    fieldName: 'baseSalary',
    component: 'Input',
    rules: 'required',
  },
  {
    label: '时薪(计时适用)',
    fieldName: 'hourlyRate',
    component: 'Input',
    rules: 'required',
  },
  {
    label: '生效日期',
    fieldName: 'effectiveDate',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    rules: 'required',
  },
  {
    label: '状态(0正常1停用)',
    fieldName: 'status',
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      optionType: 'button',
    },
    rules: 'selectRequired',
  },
  {
    label: '备注',
    fieldName: 'remark',
    component: 'Textarea',
    rules: 'required',
  },
];
