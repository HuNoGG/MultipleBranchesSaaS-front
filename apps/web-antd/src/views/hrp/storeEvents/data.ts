import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'storeId',
    label: '分店 ID (关联分店表)',
  },
  {
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    fieldName: 'eventDate',
    label: '事件日期',
  },
  {
    component: 'Select',
    componentProps: {
      // 可选从DictEnum中获取 DictEnum.HRP_STORE_EVENT_TYPE 便于维护
      options: getDictOptions('hrp_store_event_type'),
    },
    fieldName: 'eventType',
    label: '事件类型(字典: 全天放假, 上午放假, 下午放假)',
  },
  {
    component: 'Input',
    fieldName: 'description',
    label: '事件描述(如:法定节假日放假、设备检修)',
  },
];

// 需要使用i18n注意这里要改成getter形式 否则切换语言不会刷新
// export const columns: () => VxeGridProps['columns'] = () => [
export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '事件ID',
    field: 'id',
  },
  {
    title: '分店 ID (关联分店表)',
    field: 'storeId',
  },
  {
    title: '事件日期',
    field: 'eventDate',
  },
  {
    title: '事件类型(字典: 全天放假, 上午放假, 下午放假)',
    field: 'eventType',
    slots: {
      default: ({ row }) => {
        // 可选从DictEnum中获取 DictEnum.HRP_STORE_EVENT_TYPE 便于维护
        return renderDict(row.eventType, 'hrp_store_event_type');
      },
    },
  },
  {
    title: '事件描述(如:法定节假日放假、设备检修)',
    field: 'description',
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    width: 180,
  },
];
