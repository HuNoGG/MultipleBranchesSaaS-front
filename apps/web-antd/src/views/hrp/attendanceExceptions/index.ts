import type {
  AttendanceExceptionsForm,
  AttendanceExceptionsQuery,
  AttendanceExceptionsVO,
} from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询考勤异常列表
 * @param params
 * @returns 考勤异常列表
 */
export function attendanceExceptionsList(params?: AttendanceExceptionsQuery) {
  return requestClient.get<PageResult<AttendanceExceptionsVO>>(
    '/hrp/attendanceExceptions/list',
    { params },
  );
}

/**
 * 导出考勤异常列表
 * @param params
 * @returns 考勤异常列表
 */
export function attendanceExceptionsExport(params?: AttendanceExceptionsQuery) {
  return commonExport('/hrp/attendanceExceptions/export', params ?? {});
}

/**
 * 查询考勤异常详情
 * @param id id
 * @returns 考勤异常详情
 */
export function attendanceExceptionsInfo(id: ID) {
  return requestClient.get<AttendanceExceptionsVO>(
    `/hrp/attendanceExceptions/${id}`,
  );
}

/**
 * 新增考勤异常
 * @param data
 * @returns void
 */
export function attendanceExceptionsAdd(data: AttendanceExceptionsForm) {
  return requestClient.postWithMsg<void>('/hrp/attendanceExceptions', data);
}

/**
 * 更新考勤异常
 * @param data
 * @returns void
 */
export function attendanceExceptionsUpdate(data: AttendanceExceptionsForm) {
  return requestClient.putWithMsg<void>('/hrp/attendanceExceptions', data);
}

/**
 * 删除考勤异常
 * @param id id
 * @returns void
 */
export function attendanceExceptionsRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/hrp/attendanceExceptions/${id}`);
}
