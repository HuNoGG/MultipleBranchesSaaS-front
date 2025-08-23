import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'requestStoreId',
    label: '申请方分店ID (A分店)',
  },
  {
    component: 'Input',
    fieldName: 'providerStoreId',
    label: '提供方分店ID(B分店)',
  },
  {
    component: 'Input',
    fieldName: 'requestUserId',
    label: '申请人ID',
  },
  {
    component: 'Input',
    fieldName: 'transferDetails',
    label: '调货内容(品项,数量)示例:[{"item":"商品A","qty":10}]',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      // 可选从DictEnum中获取 DictEnum.HRP_INVENTORY_TRANSFER_STATUS 便于维护
      options: getDictOptions('hrp_inventory_transfer_status'),
      buttonStyle: 'solid',
      optionType: 'button',
    },
    fieldName: 'approvalStatus',
    label: '状态(字典: 待审核, 待确认, 已完成)',
  },
  {
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    fieldName: 'requestConfirmedAt',
    label: '申请方确认时间',
  },
  {
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    fieldName: 'providerConfirmedAt',
    label: '提供方确认时间',
  },
  {
    component: 'Input',
    fieldName: 'responsibleUserId',
    label: '该班次责任人ID',
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
    title: '调货单 ID',
    field: 'id',
  },
  {
    title: '申请方分店ID (A分店)',
    field: 'requestStoreId',
  },
  {
    title: '提供方分店ID(B分店)',
    field: 'providerStoreId',
  },
  {
    title: '申请人ID',
    field: 'requestUserId',
  },
  {
    title: '调货内容(品项,数量)示例:[{"item":"商品A","qty":10}]',
    field: 'transferDetails',
  },
  {
    title: '状态(字典: 待审核, 待确认, 已完成)',
    field: 'approvalStatus',
    slots: {
      default: ({ row }) => {
        // 可选从DictEnum中获取 DictEnum.HRP_INVENTORY_TRANSFER_STATUS 便于维护
        return renderDict(row.approvalStatus, 'hrp_inventory_transfer_status');
      },
    },
  },
  {
    title: '申请方确认时间',
    field: 'requestConfirmedAt',
  },
  {
    title: '提供方确认时间',
    field: 'providerConfirmedAt',
  },
  {
    title: '该班次责任人ID',
    field: 'responsibleUserId',
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

export const modalSchema: FormSchemaGetter = () => [
  {
    label: '调货单 ID',
    fieldName: 'id',
    component: 'Input',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
  },
  {
    label: '申请方分店ID (A分店)',
    fieldName: 'requestStoreId',
    component: 'Input',
    rules: 'required',
  },
  {
    label: '提供方分店ID(B分店)',
    fieldName: 'providerStoreId',
    component: 'Input',
    rules: 'required',
  },
  {
    label: '申请人ID',
    fieldName: 'requestUserId',
    component: 'Input',
    rules: 'required',
  },
  {
    label: '调货内容(品项,数量)示例:[{"item":"商品A","qty":10}]',
    fieldName: 'transferDetails',
    component: 'Input',
    rules: 'required',
  },
  {
    label: '状态(字典: 待审核, 待确认, 已完成)',
    fieldName: 'approvalStatus',
    component: 'RadioGroup',
    componentProps: {
      // 可选从DictEnum中获取 DictEnum.HRP_INVENTORY_TRANSFER_STATUS 便于维护
      options: getDictOptions('hrp_inventory_transfer_status'),
      buttonStyle: 'solid',
      optionType: 'button',
    },
    rules: 'selectRequired',
  },
  {
    label: '申请方确认时间',
    fieldName: 'requestConfirmedAt',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    rules: 'required',
  },
  {
    label: '提供方确认时间',
    fieldName: 'providerConfirmedAt',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    rules: 'required',
  },
  {
    label: '该班次责任人ID',
    fieldName: 'responsibleUserId',
    component: 'Input',
    rules: 'required',
  },
  {
    label: '状态(0正常1停用)',
    fieldName: 'status',
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      optionType: 'button',
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
