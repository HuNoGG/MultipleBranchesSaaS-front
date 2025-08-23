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
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    fieldName: 'leaveDate',
    label: '期望休假日期',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      // 可选从DictEnum中获取 DictEnum.COMMON_APPROVAL_STATUS 便于维护
      options: getDictOptions('common_approval_status'),
      buttonStyle: 'solid',
      optionType: 'button',
    },
    fieldName: 'approvalStatus',
    label: '状态(字典: 已提交, 已锁定, 已取消)',
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
    title: '期望休假日期',
    field: 'leaveDate',
  },
  {
    title: '状态(字典: 已提交, 已锁定, 已取消)',
    field: 'approvalStatus',
    slots: {
      default: ({ row }) => {
        // 可选从DictEnum中获取 DictEnum.COMMON_APPROVAL_STATUS 便于维护
        return renderDict(row.approvalStatus, 'common_approval_status');
      },
    },
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
