import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'name',
    label: '班别名称)',
  },
  {
    component: 'Input',
    fieldName: 'code',
    label: '班别代码',
  },
  {
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    fieldName: 'startTime',
    label: '开始时间',
  },
  {
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    fieldName: 'endTime',
    label: '结束时间',
  },
  {
    component: 'Input',
    fieldName: 'isCrossDay',
    label: '是否跨日',
  },
  {
    component: 'Input',
    fieldName: 'colorCode',
    label: '班表显示颜色',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      optionType: 'button',
    },
    fieldName: 'status',
    label: '状态',
  },
];

// 需要使用i18n注意这里要改成getter形式 否则切换语言不会刷新
// export const columns: () => VxeGridProps['columns'] = () => [
export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '班别唯一ID',
    field: 'id',
  },
  {
    title: '所属分店 ID',
    field: 'storeId',
  },
  {
    title: '班别名称',
    field: 'name',
  },
  {
    title: '班别代码',
    field: 'code',
  },
  {
    title: '开始时间',
    field: 'startTime',
  },
  {
    title: '结束时间',
    field: 'endTime',
  },
  {
    title: '是否跨日',
    field: 'isCrossDay',
  },
  {
    title: '班表显示颜色(如:#FF5733)',
    field: 'colorCode',
  },
  {
    title: '状态',
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
