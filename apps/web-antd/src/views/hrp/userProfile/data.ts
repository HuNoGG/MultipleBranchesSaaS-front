import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Select',
    componentProps: {
      // 可选从DictEnum中获取 DictEnum.HRP_EMPLOYEE_TYPE 便于维护
      options: getDictOptions('hrp_employee_type'),
    },
    fieldName: 'employeeType',
    label: '员工分类',
  },
  {
    component: 'Input',
    fieldName: 'mainStoreId',
    label: '分店 ID',
  },
  {
    component: 'Input',
    fieldName: 'priorityScore',
    label: '优先分数',
  },
];

// 需要使用i18n注意这里要改成getter形式 否则切换语言不会刷新
// export const columns: () => VxeGridProps['columns'] = () => [
export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '员工ID',
    field: 'userId',
  },
  {
    title: '员工分类',
    field: 'employeeType',
    slots: {
      default: ({ row }) => {
        // 可选从DictEnum中获取 DictEnum.HRP_EMPLOYEE_TYPE 便于维护
        return renderDict(row.employeeType, 'hrp_employee_type');
      },
    },
  },
  {
    title: '分店 ID',
    field: 'mainStoreId',
  },
  {
    title: '优先分数',
    field: 'priorityScore',
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
