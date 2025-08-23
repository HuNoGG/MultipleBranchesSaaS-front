import type {
  LeaveRequestsForm,
  LeaveRequestsQuery,
  LeaveRequestsVO,
} from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询期望休假/排休记录列表
 * @param params
 * @returns 期望休假/排休记录列表
 */
export function leaveRequestsList(params?: LeaveRequestsQuery) {
  return requestClient.get<PageResult<LeaveRequestsVO>>(
    '/hrp/leaveRequests/list',
    { params },
  );
}

/**
 * 导出期望休假/排休记录列表
 * @param params
 * @returns 期望休假/排休记录列表
 */
export function leaveRequestsExport(params?: LeaveRequestsQuery) {
  return commonExport('/hrp/leaveRequests/export', params ?? {});
}

/**
 * 查询期望休假/排休记录详情
 * @param id id
 * @returns 期望休假/排休记录详情
 */
export function leaveRequestsInfo(id: ID) {
  return requestClient.get<LeaveRequestsVO>(`/hrp/leaveRequests/${id}`);
}

/**
 * 新增期望休假/排休记录
 * @param data
 * @returns void
 */
export function leaveRequestsAdd(data: LeaveRequestsForm) {
  return requestClient.postWithMsg<void>('/hrp/leaveRequests', data);
}

/**
 * 更新期望休假/排休记录
 * @param data
 * @returns void
 */
export function leaveRequestsUpdate(data: LeaveRequestsForm) {
  return requestClient.putWithMsg<void>('/hrp/leaveRequests', data);
}

/**
 * 删除期望休假/排休记录
 * @param id id
 * @returns void
 */
export function leaveRequestsRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/hrp/leaveRequests/${id}`);
}
