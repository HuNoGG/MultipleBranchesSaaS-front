import type {
  ScheduleRequirementsForm,
  ScheduleRequirementsQuery,
  ScheduleRequirementsVO,
} from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询每日人力需求列表
 * @param params
 * @returns 每日人力需求列表
 */
export function scheduleRequirementsList(params?: ScheduleRequirementsQuery) {
  return requestClient.get<PageResult<ScheduleRequirementsVO>>(
    '/hrp/scheduleRequirements/list',
    { params },
  );
}

/**
 * 导出每日人力需求列表
 * @param params
 * @returns 每日人力需求列表
 */
export function scheduleRequirementsExport(params?: ScheduleRequirementsQuery) {
  return commonExport('/hrp/scheduleRequirements/export', params ?? {});
}

/**
 * 查询每日人力需求详情
 * @param id id
 * @returns 每日人力需求详情
 */
export function scheduleRequirementsInfo(id: ID) {
  return requestClient.get<ScheduleRequirementsVO>(
    `/hrp/scheduleRequirements/${id}`,
  );
}

/**
 * 新增每日人力需求
 * @param data
 * @returns void
 */
export function scheduleRequirementsAdd(data: ScheduleRequirementsForm) {
  return requestClient.postWithMsg<void>('/hrp/scheduleRequirements', data);
}

/**
 * 配置页新增Or更新人力需求
 * @param data
 * @returns void
 */
export function saveDailyRequirements(data: ScheduleRequirementsForm) {
  return requestClient.post<void>('/hrp/scheduleRequirements/save', data);
}

/**
 * 查询每日人力需求列表,包含三种类型的数据,分别组装
 * @param params
 * @returns 每日人力需求列表
 */
export function scheduleRequirementsAllTypeList(
  params?: ScheduleRequirementsQuery,
) {
  return requestClient.get<PageResult<ScheduleRequirementsVO>>(
    '/hrp/scheduleRequirements/all-by-store',
    { params },
  );
}

/**
 * 更新每日人力需求
 * @param data
 * @returns void
 */
export function scheduleRequirementsUpdate(data: ScheduleRequirementsForm) {
  return requestClient.putWithMsg<void>('/hrp/scheduleRequirements', data);
}

/**
 * 删除每日人力需求
 * @param id id
 * @returns void
 */
export function scheduleRequirementsRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/hrp/scheduleRequirements/${id}`);
}
