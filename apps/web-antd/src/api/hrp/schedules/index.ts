import type { SchedulesForm, SchedulesQuery, SchedulesVO } from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询排班列表
 * @param params
 * @returns 排班列表
 */
export function schedulesList(params?: SchedulesQuery) {
  return requestClient.get<PageResult<SchedulesVO>>('/hrp/schedules/list', {
    params,
  });
}

/**
 * 导出排班列表
 * @param params
 * @returns 排班列表
 */
export function schedulesExport(params?: SchedulesQuery) {
  return commonExport('/hrp/schedules/export', params ?? {});
}

/**
 * 查询排班详情
 * @param id id
 * @returns 排班详情
 */
export function schedulesInfo(id: ID) {
  return requestClient.get<SchedulesVO>(`/hrp/schedules/${id}`);
}

/**
 * 新增排班
 * @param data
 * @returns void
 */
export function schedulesAdd(data: SchedulesForm) {
  return requestClient.postWithMsg<void>('/hrp/schedules', data);
}

/**
 * 更新排班
 * @param data
 * @returns void
 */
export function schedulesUpdate(data: SchedulesForm) {
  return requestClient.putWithMsg<void>('/hrp/schedules', data);
}

/**
 * 删除排班
 * @param id id
 * @returns void
 */
export function schedulesRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/hrp/schedules/${id}`);
}

// 查询排班计划列表
export function getSchedulePlan(params) {
  return requestClient.get('/hrp/schedules/plan', { params });
}

// 查询排班历史列表
export function getScheduleHistory(params) {
  return requestClient.get('/hrp/schedules/history', { params });
}

// 智能生成排班计划
export function generateSchedule(data) {
  return requestClient.postWithMsg<void>('/hrp/schedules/generate', data);
}
