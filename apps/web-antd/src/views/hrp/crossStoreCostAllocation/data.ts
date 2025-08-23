import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'userId',
    label: '员工 ID',
  },
  {
    component: 'Select',
    componentProps: {
      // 可选从DictEnum中获取 DictEnum.HRP_COST_ALLOCATION_TYPE 便于维护
      options: getDictOptions('hrp_cost_allocation_type'),
    },
    fieldName: 'allocationType',
    label: '分摊方式',
  },
  {
    component: 'Input',
    fieldName: 'allocationRules',
    label: '分摊规则',
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
    title: '唯一ID',
    field: 'id',
  },
  {
    title: '员工 ID',
    field: 'userId',
  },
  {
    title: '分摊方式',
    field: 'allocationType',
    slots: {
      default: ({ row }) => {
        // 可选从DictEnum中获取 DictEnum.HRP_COST_ALLOCATION_TYPE 便于维护
        return renderDict(row.allocationType, 'hrp_cost_allocation_type');
      },
    },
  },
  {
    title: '分摊规则',
    field: 'allocationRules',
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
