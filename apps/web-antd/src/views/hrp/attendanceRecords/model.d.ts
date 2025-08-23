import type { BaseEntity, PageQuery } from '#/api/common';

export interface AttendanceRecordsVO {
  /**
   * 记录唯一ID
   */
  id: number | string;

  /**
   * 员工 ID
   */
  userId: number | string;

  /**
   * 关联的排班记录ID
   */
  scheduleId: number | string;

  /**
   * 上班打卡时间
   */
  clockInTime: string;

  /**
   * 下班打卡时间
   */
  clockOutTime: string;

  /**
   * 记录日期
   */
  recordDate: string;
}

export interface AttendanceRecordsForm extends BaseEntity {
  /**
   * 记录唯一ID
   */
  id?: number | string;

  /**
   * 员工 ID
   */
  userId?: number | string;

  /**
   * 关联的排班记录ID
   */
  scheduleId?: number | string;

  /**
   * 上班打卡时间
   */
  clockInTime?: string;

  /**
   * 下班打卡时间
   */
  clockOutTime?: string;

  /**
   * 记录日期
   */
  recordDate?: string;
}

export interface AttendanceRecordsQuery extends PageQuery {
  /**
   * 员工 ID
   */
  userId?: number | string;

  /**
   * 关联的排班记录ID
   */
  scheduleId?: number | string;

  /**
   * 上班打卡时间
   */
  clockInTime?: string;

  /**
   * 下班打卡时间
   */
  clockOutTime?: string;

  /**
   * 记录日期
   */
  recordDate?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
