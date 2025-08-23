import type {
  UserAvailabilityForm,
  UserAvailabilityQuery,
  UserAvailabilityVO,
} from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询员工可上班时段列表
 * @param params
 * @returns 员工可上班时段列表
 */
export function userAvailabilityList(params?: UserAvailabilityQuery) {
  return requestClient.get<PageResult<UserAvailabilityVO>>(
    '/hrp/userAvailability/list',
    { params },
  );
}

/**
 * 导出员工可上班时段列表
 * @param params
 * @returns 员工可上班时段列表
 */
export function userAvailabilityExport(params?: UserAvailabilityQuery) {
  return commonExport('/hrp/userAvailability/export', params ?? {});
}

/**
 * 查询员工可上班时段详情
 * @param id id
 * @returns 员工可上班时段详情
 */
export function userAvailabilityInfo(id: ID) {
  return requestClient.get<UserAvailabilityVO>(`/hrp/userAvailability/${id}`);
}

/**
 * 新增员工可上班时段
 * @param data
 * @returns void
 */
export function userAvailabilityAdd(data: UserAvailabilityForm) {
  return requestClient.postWithMsg<void>('/hrp/userAvailability', data);
}

/**
 * 更新员工可上班时段
 * @param data
 * @returns void
 */
export function userAvailabilityUpdate(data: UserAvailabilityForm) {
  return requestClient.putWithMsg<void>('/hrp/userAvailability', data);
}

/**
 * 删除员工可上班时段
 * @param id id
 * @returns void
 */
export function userAvailabilityRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/hrp/userAvailability/${id}`);
}
