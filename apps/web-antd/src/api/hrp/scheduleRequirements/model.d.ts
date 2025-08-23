import type { BaseEntity, PageQuery } from '#/api/common';

export interface ScheduleRequirementsVO {
  /**
   * 唯一ID
   */
  id: number | string;

  /**
   * 分店 ID
   */
  storeId: number | string;

  /**
   * 日期类型(字典: 平日, 假日, 特殊节日)
   */
  dayType: string;

  /**
   * 班别 ID
   */
  shiftId: number | string;

  /**
   * 岗位(技能) ID
   */
  skillId: number | string;

  /**
   * 需求人数
   */
  requiredCount: number;

  /**
   * 状态(0正常1停用)
   */
  status: string;

  /**
   * 备注
   */
  remark: string;
}

export interface ScheduleRequirementsForm extends BaseEntity {
  /**
   * 唯一ID
   */
  id?: number | string;

  /**
   * 分店 ID
   */
  storeId?: number | string;

  /**
   * 日期类型(字典: 平日, 假日, 特殊节日)
   */
  dayType?: string;

  /**
   * 班别 ID
   */
  shiftId?: number | string;

  /**
   * 岗位(技能) ID
   */
  skillId?: number | string;

  /**
   * 需求人数
   */
  requiredCount?: number;

  /**
   * 状态(0正常1停用)
   */
  status?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface ScheduleRequirementsQuery extends PageQuery {
  /**
   * 分店 ID
   */
  storeId?: number | string;

  /**
   * 日期类型(字典: 平日, 假日, 特殊节日)
   */
  dayType?: string;

  /**
   * 班别 ID
   */
  shiftId?: number | string;

  /**
   * 岗位(技能) ID
   */
  skillId?: number | string;

  /**
   * 需求人数
   */
  requiredCount?: number;

  /**
   * 状态(0正常1停用)
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
