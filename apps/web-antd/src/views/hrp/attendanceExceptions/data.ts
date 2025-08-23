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
    fieldName: 'exceptionDate',
    label: '异常日期',
  },
  {
    component: 'Select',
    componentProps: {
      // 可选从DictEnum中获取 DictEnum.HRP_ATTENDANCE_EXCEPTION_TYPE 便于维护
      options: getDictOptions('hrp_attendance_exception_type'),
    },
    fieldName: 'exceptionType',
    label: '异常类型(字典: 忘记打卡, 迟到未请假, 早退未请假, 缺勤)',
  },
  {
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    fieldName: 'originalClockIn',
    label: '原始打卡(上班)',
  },
  {
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    fieldName: 'originalClockOut',
    label: '原始打卡(下班)',
  },
  {
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    fieldName: 'correctedClockIn',
    label: '修正后打卡(上班)',
  },
  {
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    fieldName: 'correctedClockOut',
    label: '修正后打卡(下班)',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      // 可选从DictEnum中获取 DictEnum.HRP_ATTENDANCE_APPROVAL_STATUS 便于维护
      options: getDictOptions('hrp_attendance_approval_status'),
      buttonStyle: 'solid',
      optionType: 'button',
    },
    fieldName: 'approvalStatus',
    label: '状态(字典: 待处理, 已修正)',
  },
  {
    component: 'Input',
    fieldName: 'approvedBy',
    label: '审核人 ID',
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
    title: '异常记录 ID',
    field: 'id',
  },
  {
    title: '员工 ID',
    field: 'userId',
  },
  {
    title: '异常日期',
    field: 'exceptionDate',
  },
  {
    title: '异常类型(字典: 忘记打卡, 迟到未请假, 早退未请假, 缺勤)',
    field: 'exceptionType',
    slots: {
      default: ({ row }) => {
        // 可选从DictEnum中获取 DictEnum.HRP_ATTENDANCE_EXCEPTION_TYPE 便于维护
        return renderDict(row.exceptionType, 'hrp_attendance_exception_type');
      },
    },
  },
  {
    title: '原始打卡(上班)',
    field: 'originalClockIn',
  },
  {
    title: '原始打卡(下班)',
    field: 'originalClockOut',
  },
  {
    title: '修正后打卡(上班)',
    field: 'correctedClockIn',
  },
  {
    title: '修正后打卡(下班)',
    field: 'correctedClockOut',
  },
  {
    title: '状态(字典: 待处理, 已修正)',
    field: 'approvalStatus',
    slots: {
      default: ({ row }) => {
        // 可选从DictEnum中获取 DictEnum.HRP_ATTENDANCE_APPROVAL_STATUS 便于维护
        return renderDict(row.approvalStatus, 'hrp_attendance_approval_status');
      },
    },
  },
  {
    title: '审核人 ID',
    field: 'approvedBy',
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
