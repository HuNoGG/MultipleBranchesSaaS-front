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
    label: '分摊方式(字典: 依时数, 依比例)',
  },
  {
    component: 'Input',
    fieldName: 'allocationRules',
    label: '分摊规则 示例:{"storeA": 50, "storeB":50} (比例分摊)',
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
    title: '唯一ID',
    field: 'id',
  },
  {
    title: '员工 ID',
    field: 'userId',
  },
  {
    title: '分摊方式(字典: 依时数, 依比例)',
    field: 'allocationType',
    slots: {
      default: ({ row }) => {
        // 可选从DictEnum中获取 DictEnum.HRP_COST_ALLOCATION_TYPE 便于维护
        return renderDict(row.allocationType, 'hrp_cost_allocation_type');
      },
    },
  },
  {
    title: '分摊规则 示例:{"storeA": 50, "storeB":50} (比例分摊)',
    field: 'allocationRules',
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
