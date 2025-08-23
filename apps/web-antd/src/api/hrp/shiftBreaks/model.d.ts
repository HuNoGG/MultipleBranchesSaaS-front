import type { BaseEntity, PageQuery } from '#/api/common';

export interface ShiftBreaksVO {
  /**
   * 唯一ID
   */
  id: number | string;

  /**
   * 班别 ID
   */
  shiftId: number | string;

  /**
   * 休息开始时间
   */
  breakStartTime: string;

  /**
   * 休息结束时间
   */
  breakEndTime: string;
}

export interface ShiftBreaksForm extends BaseEntity {
  /**
   * 唯一ID
   */
  id?: number | string;

  /**
   * 班别 ID
   */
  shiftId?: number | string;

  /**
   * 休息开始时间
   */
  breakStartTime?: string;

  /**
   * 休息结束时间
   */
  breakEndTime?: string;
}

export interface ShiftBreaksQuery extends PageQuery {
  /**
   * 班别 ID
   */
  shiftId?: number | string;

  /**
   * 休息开始时间
   */
  breakStartTime?: string;

  /**
   * 休息结束时间
   */
  breakEndTime?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
