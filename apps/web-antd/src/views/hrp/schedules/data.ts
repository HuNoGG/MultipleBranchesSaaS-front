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
    fieldName: 'storeId',
    label: '上班分店 ID',
  },
  {
    component: 'Input',
    fieldName: 'shiftId',
    label: '班别 ID',
  },
  {
    component: 'Input',
    fieldName: 'skillId',
    label: '担任岗位 ID',
  },
  {
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    fieldName: 'scheduleDate',
    label: '排班日期',
  },
];

// 需要使用i18n注意这里要改成getter形式 否则切换语言不会刷新
// export const columns: () => VxeGridProps['columns'] = () => [
export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '排班记录唯一ID',
    field: 'id',
  },
  {
    title: '员工 ID',
    field: 'userId',
  },
  {
    title: '上班分店 ID',
    field: 'storeId',
  },
  {
    title: '班别 ID',
    field: 'shiftId',
  },
  {
    title: '担任岗位 ID',
    field: 'skillId',
  },
  {
    title: '排班日期',
    field: 'scheduleDate',
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
    label: '排班记录唯一ID',
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
    label: '上班分店 ID',
    fieldName: 'storeId',
    component: 'Input',
    rules: 'required',
  },
  {
    label: '班别 ID',
    fieldName: 'shiftId',
    component: 'Input',
    rules: 'required',
  },
  {
    label: '担任岗位 ID',
    fieldName: 'skillId',
    component: 'Input',
    rules: 'required',
  },
  {
    label: '排班日期',
    fieldName: 'scheduleDate',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
  },
];
