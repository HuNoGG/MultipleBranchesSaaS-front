import type { PageQuery, BaseEntity } from '#/api/common';

export interface UserAvailabilityVO {
  /**
   * 唯一ID
   */
  id: string | number;

  /**
   * 员工 ID
   */
  userId: string | number;

  /**
   * 星期几 (1=周一, 2=周二, ..., 7=周日)
   */
  dayOfWeek: number;

  /**
   * 可上班的开始时间
   */
  startTime: string;

  /**
   * 可上班的结束时间
   */
  endTime: string;
}

export interface UserAvailabilityForm extends BaseEntity {
  /**
   * 唯一ID
   */
  id?: string | number;

  /**
   * 员工 ID
   */
  userId?: string | number;

  /**
   * 星期几 (1=周一, 2=周二, ..., 7=周日)
   */
  dayOfWeek?: number;

  /**
   * 可上班的开始时间
   */
  startTime?: string;

  /**
   * 可上班的结束时间
   */
  endTime?: string;
}

export interface UserAvailabilityQuery extends PageQuery {
  /**
   * 员工 ID
   */
  userId?: string | number;

  /**
   * 星期几 (1=周一, 2=周二, ..., 7=周日)
   */
  dayOfWeek?: number;

  /**
   * 可上班的开始时间
   */
  startTime?: string;

  /**
   * 可上班的结束时间
   */
  endTime?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
