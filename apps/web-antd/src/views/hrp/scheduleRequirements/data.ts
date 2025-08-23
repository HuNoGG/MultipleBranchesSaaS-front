import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'storeId',
    label: '分店 ID',
  },
  {
    component: 'Select',
    componentProps: {
      // 可选从DictEnum中获取 DictEnum.HRP_SCHEDULE_DAY_TYPE 便于维护
      options: getDictOptions('hrp_schedule_day_type'),
    },
    fieldName: 'dayType',
    label: '日期类型',
  },
  {
    component: 'Input',
    fieldName: 'shiftId',
    label: '班别 ID',
  },
  {
    component: 'Input',
    fieldName: 'skillId',
    label: '岗位(技能) ID',
  },
  {
    component: 'Input',
    fieldName: 'requiredCount',
    label: '需求人数',
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
    title: '分店 ID',
    field: 'storeId',
  },
  {
    title: '日期类型',
    field: 'dayType',
    slots: {
      default: ({ row }) => {
        // 可选从DictEnum中获取 DictEnum.HRP_SCHEDULE_DAY_TYPE 便于维护
        return renderDict(row.dayType, 'hrp_schedule_day_type');
      },
    },
  },
  {
    title: '班别 ID',
    field: 'shiftId',
  },
  {
    title: '岗位(技能) ID',
    field: 'skillId',
  },
  {
    title: '需求人数',
    field: 'requiredCount',
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
    label: '唯一ID',
    fieldName: 'id',
    component: 'Input',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
  },
  {
    label: '分店 ID',
    fieldName: 'storeId',
    component: 'Input',
    rules: 'required',
  },
  {
    label: '日期类型',
    fieldName: 'dayType',
    component: 'Select',
    componentProps: {
      // 可选从DictEnum中获取 DictEnum.HRP_SCHEDULE_DAY_TYPE 便于维护
      options: getDictOptions('hrp_schedule_day_type'),
    },
    rules: 'selectRequired',
  },
  {
    label: '班别 ID',
    fieldName: 'shiftId',
    component: 'Input',
    rules: 'required',
  },
  {
    label: '岗位(技能) ID',
    fieldName: 'skillId',
    component: 'Input',
    rules: 'required',
  },
  {
    label: '需求人数',
    fieldName: 'requiredCount',
    component: 'Input',
  },

  {
    label: '备注',
    fieldName: 'remark',
    component: 'Textarea',
    rules: 'required',
  },
];
