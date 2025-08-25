import type { ShiftsForm, ShiftsQuery, ShiftsVO } from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询班别设定列表
 * @param params
 * @returns 班别设定列表
 */
export function shiftsList(params?: ShiftsQuery) {
  return requestClient.get<PageResult<ShiftsVO>>('/hrp/shifts/list', {
    params,
  });
}

/**
 * 查询班别和休息设定列表
 * @param params
 * @returns 班别设定列表
 */
export function shiftsAndRestTime(params?: ShiftsQuery) {
  return requestClient.get<PageResult<ShiftsVO>>(
    '/hrp/shifts/shiftsAndRestTime',
    {
      params,
    },
  );
}

/**
 * 导出班别设定列表
 * @param params
 * @returns 班别设定列表
 */
export function shiftsExport(params?: ShiftsQuery) {
  return commonExport('/hrp/shifts/export', params ?? {});
}

/**
 * 查询班别设定详情
 * @param id id
 * @returns 班别设定详情
 */
export function shiftsInfo(id: ID) {
  return requestClient.get<ShiftsVO>(`/hrp/shifts/${id}`);
}

/**
 * 新增班别设定
 * @param data
 * @returns void
 */
export function shiftsAdd(data: ShiftsForm) {
  return requestClient.postWithMsg<void>('/hrp/shifts', data);
}

/**
 * 更新班别设定
 * @param data
 * @returns void
 */
export function shiftsUpdate(data: ShiftsForm) {
  return requestClient.putWithMsg<void>('/hrp/shifts', data);
}

/**
 * 删除班别设定
 * @param id id
 * @returns void
 */
export function shiftsRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/hrp/shifts/${id}`);
}
