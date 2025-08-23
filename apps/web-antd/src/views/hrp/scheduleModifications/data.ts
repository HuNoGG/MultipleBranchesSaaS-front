import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'scheduleId',
    label: '关联的排班记录ID(原排班表主键)',
  },
  {
    component: 'Input',
    fieldName: 'originalUserId',
    label: '原员工ID(修改前的排班员工)',
  },
  {
    component: 'Input',
    fieldName: 'newUserId',
    label: '新员工ID(修改后的排班员工,change_type为'新增临时')',
  },
  {
    component: 'Select',
    componentProps: {
      // 可选从DictEnum中获取 DictEnum.HRP_SCHEDULE_CHANGE_TYPE 便于维护
      options: getDictOptions('hrp_schedule_change_type'),
    },
    fieldName: 'changeType',
    label: '修改类型(字典: 调班, 替班, 新增临时)',
  },
  {
    component: 'Input',
    fieldName: 'changedBy',
    label: '修改人ID(操作修改的用户)',
  },
  {
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    fieldName: 'changeTime',
    label: '修改时间',
  },
];

// 需要使用i18n注意这里要改成getter形式 否则切换语言不会刷新
// export const columns: () => VxeGridProps['columns'] = () => [
export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '记录 ID',
    field: 'id',
  },
  {
    title: '关联的排班记录ID(原排班表主键)',
    field: 'scheduleId',
  },
  {
    title: '原员工ID(修改前的排班员工)',
    field: 'originalUserId',
  },
  {
    title: '新员工ID(修改后的排班员工,change_type为'新增临时')',
    field: 'newUserId',
  },
  {
    title: '修改类型(字典: 调班, 替班, 新增临时)',
    field: 'changeType',
    slots: {
      default: ({ row }) => {
        // 可选从DictEnum中获取 DictEnum.HRP_SCHEDULE_CHANGE_TYPE 便于维护
        return renderDict(row.changeType, 'hrp_schedule_change_type');
      },
    },
  },
  {
    title: '修改人ID(操作修改的用户)',
    field: 'changedBy',
  },
  {
    title: '修改时间',
    field: 'changeTime',
  },
  {
    title: '备注(如:调班原因、替班说明等)',
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

