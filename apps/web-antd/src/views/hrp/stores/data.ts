import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'name',
    label: '分店名称',
  },
  {
    component: 'Input',
    fieldName: 'address',
    label: '分店地址',
  },
  // {
  //   component: 'Input',
  //   fieldName: 'crossDayRule',
  //   label: '跨日工时归属规则(字典: by_shift_start, by_calendar_day)',
  // },
  // {
  //   component: 'RadioGroup',
  //   componentProps: {
  //     buttonStyle: 'solid',
  //     optionType: 'button',
  //   },
  //   fieldName: 'status',
  //   label: '状态(0正常1停用)',
  // },
];

// 需要使用i18n注意这里要改成getter形式 否则切换语言不会刷新
// export const columns: () => VxeGridProps['columns'] = () => [
export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '分店唯一ID',
    field: 'id',
  },
  {
    title: '分店名称',
    field: 'name',
  },
  {
    title: '分店地址',
    field: 'address',
  },
  // {
  //   title: '跨日工时归属规则(字典: by_shift_start, by_calendar_day)',
  //   field: 'crossDayRule',
  // },
  {
    title: '状态',
    field: 'status',
    slots: {
      default: (scope) => {
        const status = scope.row.status;
        if (status === '0') {
          return '正常';
        } else if (status === '1') {
          return '停用';
        }
      },
    },
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
