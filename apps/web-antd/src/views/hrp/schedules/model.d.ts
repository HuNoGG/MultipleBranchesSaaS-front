import type { PageQuery, BaseEntity } from '#/api/common';

export interface SchedulesVO {
  /**
   * 排班记录唯一ID
   */
  id: string | number;

  /**
   * 员工 ID
   */
  userId: string | number;

  /**
   * 上班分店 ID
   */
  storeId: string | number;

  /**
   * 班别 ID
   */
  shiftId: string | number;

  /**
   * 担任岗位 ID
   */
  skillId: string | number;

  /**
   * 排班日期
   */
  scheduleDate: string;
}

export interface SchedulesForm extends BaseEntity {
  /**
   * 排班记录唯一ID
   */
  id?: string | number;

  /**
   * 员工 ID
   */
  userId?: string | number;

  /**
   * 上班分店 ID
   */
  storeId?: string | number;

  /**
   * 班别 ID
   */
  shiftId?: string | number;

  /**
   * 担任岗位 ID
   */
  skillId?: string | number;

  /**
   * 排班日期
   */
  scheduleDate?: string;
}

export interface SchedulesQuery extends PageQuery {
  /**
   * 员工 ID
   */
  userId?: string | number;

  /**
   * 上班分店 ID
   */
  storeId?: string | number;

  /**
   * 班别 ID
   */
  shiftId?: string | number;

  /**
   * 担任岗位 ID
   */
  skillId?: string | number;

  /**
   * 排班日期
   */
  scheduleDate?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
