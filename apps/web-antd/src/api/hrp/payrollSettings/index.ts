import type {
  PayrollSettingsForm,
  PayrollSettingsQuery,
  PayrollSettingsVO,
} from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询薪资规则列表
 * @param params
 * @returns 薪资规则列表
 */
export function payrollSettingsList(params?: PayrollSettingsQuery) {
  return requestClient.get<PageResult<PayrollSettingsVO>>(
    '/hrp/payrollSettings/list',
    { params },
  );
}

/**
 * 导出薪资规则列表
 * @param params
 * @returns 薪资规则列表
 */
export function payrollSettingsExport(params?: PayrollSettingsQuery) {
  return commonExport('/hrp/payrollSettings/export', params ?? {});
}

/**
 * 查询薪资规则详情
 * @param id id
 * @returns 薪资规则详情
 */
export function payrollSettingsInfo(id: ID) {
  return requestClient.get<PayrollSettingsVO>(`/hrp/payrollSettings/${id}`);
}

/**
 * 新增薪资规则
 * @param data
 * @returns void
 */
export function payrollSettingsAdd(data: PayrollSettingsForm) {
  return requestClient.postWithMsg<void>('/hrp/payrollSettings', data);
}

/**
 * 更新薪资规则
 * @param data
 * @returns void
 */
export function payrollSettingsUpdate(data: PayrollSettingsForm) {
  return requestClient.putWithMsg<void>('/hrp/payrollSettings', data);
}

/**
 * 删除薪资规则
 * @param id id
 * @returns void
 */
export function payrollSettingsRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/hrp/payrollSettings/${id}`);
}
