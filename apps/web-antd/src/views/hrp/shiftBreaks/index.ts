import type { ShiftBreaksVO, ShiftBreaksForm, ShiftBreaksQuery } from './model';

import type { ID, IDS } from '#/api/common';
import type { PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询班别休息时段列表
 * @param params
 * @returns 班别休息时段列表
 */
export function shiftBreaksList(params?: ShiftBreaksQuery) {
  return requestClient.get<PageResult<ShiftBreaksVO>>('/hrp/shiftBreaks/list', {
    params,
  });
}

/**
 * 导出班别休息时段列表
 * @param params
 * @returns 班别休息时段列表
 */
export function shiftBreaksExport(params?: ShiftBreaksQuery) {
  return commonExport('/hrp/shiftBreaks/export', params ?? {});
}

/**
 * 查询班别休息时段详情
 * @param id id
 * @returns 班别休息时段详情
 */
export function shiftBreaksInfo(id: ID) {
  return requestClient.get<ShiftBreaksVO>(`/hrp/shiftBreaks/${id}`);
}

/**
 * 新增班别休息时段
 * @param data
 * @returns void
 */
export function shiftBreaksAdd(data: ShiftBreaksForm) {
  return requestClient.postWithMsg<void>('/hrp/shiftBreaks', data);
}

/**
 * 更新班别休息时段
 * @param data
 * @returns void
 */
export function shiftBreaksUpdate(data: ShiftBreaksForm) {
  return requestClient.putWithMsg<void>('/hrp/shiftBreaks', data);
}

/**
 * 删除班别休息时段
 * @param id id
 * @returns void
 */
export function shiftBreaksRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/hrp/shiftBreaks/${id}`);
}
