import type {
  LeaveApplicationsForm,
  LeaveApplicationsQuery,
  LeaveApplicationsVO,
} from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询正式请假申请列表
 * @param params
 * @returns 正式请假申请列表
 */
export function leaveApplicationsList(params?: LeaveApplicationsQuery) {
  return requestClient.get<PageResult<LeaveApplicationsVO>>(
    '/hrp/leaveApplications/list',
    { params },
  );
}

/**
 * 导出正式请假申请列表
 * @param params
 * @returns 正式请假申请列表
 */
export function leaveApplicationsExport(params?: LeaveApplicationsQuery) {
  return commonExport('/hrp/leaveApplications/export', params ?? {});
}

/**
 * 查询正式请假申请详情
 * @param id id
 * @returns 正式请假申请详情
 */
export function leaveApplicationsInfo(id: ID) {
  return requestClient.get<LeaveApplicationsVO>(`/hrp/leaveApplications/${id}`);
}

/**
 * 新增正式请假申请
 * @param data
 * @returns void
 */
export function leaveApplicationsAdd(data: LeaveApplicationsForm) {
  return requestClient.postWithMsg<void>('/hrp/leaveApplications', data);
}

/**
 * 更新正式请假申请
 * @param data
 * @returns void
 */
export function leaveApplicationsUpdate(data: LeaveApplicationsForm) {
  return requestClient.putWithMsg<void>('/hrp/leaveApplications', data);
}

/**
 * 删除正式请假申请
 * @param id id
 * @returns void
 */
export function leaveApplicationsRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/hrp/leaveApplications/${id}`);
}
