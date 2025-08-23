import type {
  PayrollRecordsForm,
  PayrollRecordsQuery,
  PayrollRecordsVO,
} from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询薪资单记录列表
 * @param params
 * @returns 薪资单记录列表
 */
export function payrollRecordsList(params?: PayrollRecordsQuery) {
  return requestClient.get<PageResult<PayrollRecordsVO>>(
    '/hrp/payrollRecords/list',
    { params },
  );
}

/**
 * 导出薪资单记录列表
 * @param params
 * @returns 薪资单记录列表
 */
export function payrollRecordsExport(params?: PayrollRecordsQuery) {
  return commonExport('/hrp/payrollRecords/export', params ?? {});
}

/**
 * 查询薪资单记录详情
 * @param id id
 * @returns 薪资单记录详情
 */
export function payrollRecordsInfo(id: ID) {
  return requestClient.get<PayrollRecordsVO>(`/hrp/payrollRecords/${id}`);
}

/**
 * 新增薪资单记录
 * @param data
 * @returns void
 */
export function payrollRecordsAdd(data: PayrollRecordsForm) {
  return requestClient.postWithMsg<void>('/hrp/payrollRecords', data);
}

/**
 * 更新薪资单记录
 * @param data
 * @returns void
 */
export function payrollRecordsUpdate(data: PayrollRecordsForm) {
  return requestClient.putWithMsg<void>('/hrp/payrollRecords', data);
}

/**
 * 删除薪资单记录
 * @param id id
 * @returns void
 */
export function payrollRecordsRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/hrp/payrollRecords/${id}`);
}
