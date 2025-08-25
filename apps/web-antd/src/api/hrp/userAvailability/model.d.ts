import type { BaseEntity, DayOfWeekNumber, PageQuery } from '#/api/common';

export interface UserAvailabilityVO {
  /**
   * 唯一ID
   */
  id: number | string;

  /**
   * 员工 ID
   */
  userId: number | string;

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
  id?: number | string;

  /**
   * 员工 ID
   */
  userId?: number | string;

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
  userId?: number | string;

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

// 定义可上班时间对象的结构
export interface Availability {
  id: number; // 假设每个对象有唯一ID
  dayOfWeek: DayOfWeekNumber; // 使用我们定义的精确类型
  startTime: string;
  endTime: string;
}
