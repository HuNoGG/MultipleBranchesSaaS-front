import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'name',
    label: '技能名称',
  },
];

// 需要使用i18n注意这里要改成getter形式 否则切换语言不会刷新
// export const columns: () => VxeGridProps['columns'] = () => [
export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '技能ID',
    field: 'id',
  },
  {
    title: '技能名称',
    field: 'name',
  },
  {
    title: '状态',
    field: 'status',
    formatter: ({ cellValue }) => (cellValue === '0' ? '正常' : '停用'),
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
    label: '技能唯一ID',
    fieldName: 'id',
    component: 'Input',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
  },
  {
    label: '技能名称',
    fieldName: 'name',
    component: 'Input',
    rules: 'required',
  },
  {
    label: '状态',
    fieldName: 'status',
    component: 'RadioGroup',
    defaultValue: 0,
    componentProps: {
      buttonStyle: 'solid',
      optionType: 'button',
      options: [
        { label: '正常', value: 0 },
        { label: '停用', value: 1 },
      ],
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
