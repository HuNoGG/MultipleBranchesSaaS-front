import type {
  AttendanceRecordsForm,
  AttendanceRecordsQuery,
  AttendanceRecordsVO,
} from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询打卡记录列表
 * @param params
 * @returns 打卡记录列表
 */
export function attendanceRecordsList(params?: AttendanceRecordsQuery) {
  return requestClient.get<PageResult<AttendanceRecordsVO>>(
    '/hrp/attendanceRecords/list',
    { params },
  );
}

/**
 * 导出打卡记录列表
 * @param params
 * @returns 打卡记录列表
 */
export function attendanceRecordsExport(params?: AttendanceRecordsQuery) {
  return commonExport('/hrp/attendanceRecords/export', params ?? {});
}

/**
 * 查询打卡记录详情
 * @param id id
 * @returns 打卡记录详情
 */
export function attendanceRecordsInfo(id: ID) {
  return requestClient.get<AttendanceRecordsVO>(`/hrp/attendanceRecords/${id}`);
}

/**
 * 新增打卡记录
 * @param data
 * @returns void
 */
export function attendanceRecordsAdd(data: AttendanceRecordsForm) {
  return requestClient.postWithMsg<void>('/hrp/attendanceRecords', data);
}

/**
 * 更新打卡记录
 * @param data
 * @returns void
 */
export function attendanceRecordsUpdate(data: AttendanceRecordsForm) {
  return requestClient.putWithMsg<void>('/hrp/attendanceRecords', data);
}

/**
 * 删除打卡记录
 * @param id id
 * @returns void
 */
export function attendanceRecordsRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/hrp/attendanceRecords/${id}`);
}
