import type {
  ScheduleModificationsForm,
  ScheduleModificationsQuery,
  ScheduleModificationsVO,
} from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询排班修改记录列表
 * @param params
 * @returns 排班修改记录列表
 */
export function scheduleModificationsList(params?: ScheduleModificationsQuery) {
  return requestClient.get<PageResult<ScheduleModificationsVO>>(
    '/hrp/scheduleModifications/list',
    { params },
  );
}

/**
 * 导出排班修改记录列表
 * @param params
 * @returns 排班修改记录列表
 */
export function scheduleModificationsExport(
  params?: ScheduleModificationsQuery,
) {
  return commonExport('/hrp/scheduleModifications/export', params ?? {});
}

/**
 * 查询排班修改记录详情
 * @param id id
 * @returns 排班修改记录详情
 */
export function scheduleModificationsInfo(id: ID) {
  return requestClient.get<ScheduleModificationsVO>(
    `/hrp/scheduleModifications/${id}`,
  );
}

/**
 * 新增排班修改记录
 * @param data
 * @returns void
 */
export function scheduleModificationsAdd(data: ScheduleModificationsForm) {
  return requestClient.postWithMsg<void>('/hrp/scheduleModifications', data);
}

/**
 * 更新排班修改记录
 * @param data
 * @returns void
 */
export function scheduleModificationsUpdate(data: ScheduleModificationsForm) {
  return requestClient.putWithMsg<void>('/hrp/scheduleModifications', data);
}

/**
 * 删除排班修改记录
 * @param id id
 * @returns void
 */
export function scheduleModificationsRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/hrp/scheduleModifications/${id}`);
}
