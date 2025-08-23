import type { BaseEntity, PageQuery } from '#/api/common';

export interface SchedulesVO {
  /**
   * 排班记录唯一ID
   */
  id: number | string;

  /**
   * 员工 ID
   */
  userId: number | string;

  /**
   * 上班分店 ID
   */
  storeId: number | string;

  /**
   * 班别 ID
   */
  shiftId: number | string;

  /**
   * 担任岗位 ID
   */
  skillId: number | string;

  /**
   * 排班日期
   */
  scheduleDate: string;
}

export interface SchedulesForm extends BaseEntity {
  /**
   * 排班记录唯一ID
   */
  id?: number | string;

  /**
   * 员工 ID
   */
  userId?: number | string;

  /**
   * 上班分店 ID
   */
  storeId?: number | string;

  /**
   * 班别 ID
   */
  shiftId?: number | string;

  /**
   * 担任岗位 ID
   */
  skillId?: number | string;

  /**
   * 排班日期
   */
  scheduleDate?: string;
}

export interface SchedulesQuery extends PageQuery {
  /**
   * 员工 ID
   */
  userId?: number | string;

  /**
   * 上班分店 ID
   */
  storeId?: number | string;

  /**
   * 班别 ID
   */
  shiftId?: number | string;

  /**
   * 担任岗位 ID
   */
  skillId?: number | string;

  /**
   * 排班日期
   */
  scheduleDate?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
