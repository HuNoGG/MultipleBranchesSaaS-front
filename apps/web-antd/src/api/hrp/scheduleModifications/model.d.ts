import type { BaseEntity, PageQuery } from '#/api/common';

export interface ScheduleModificationsVO {
  /**
   * 记录 ID
   */
  id: number | string;

  /**
   * 关联的排班记录ID(原排班表主键)
   */
  scheduleId: number | string;

  /**
   * 原员工ID(修改前的排班员工)
   */
  originalUserId: number | string;

  /**
   * 新员工ID(修改后的排班员工,change_type为'新增临时')
   */
  newUserId: number | string;

  /**
   * 修改类型(字典: 调班, 替班, 新增临时)
   */
  changeType: string;

  /**
   * 修改人ID(操作修改的用户)
   */
  changedBy: number;

  /**
   * 修改时间
   */
  changeTime: string;

  /**
   * 备注(如:调班原因、替班说明等)
   */
  remark: string;
}

export interface ScheduleModificationsForm extends BaseEntity {
  /**
   * 记录 ID
   */
  id?: number | string;

  /**
   * 关联的排班记录ID(原排班表主键)
   */
  scheduleId?: number | string;

  /**
   * 原员工ID(修改前的排班员工)
   */
  originalUserId?: number | string;

  /**
   * 新员工ID(修改后的排班员工,change_type为'新增临时')
   */
  newUserId?: number | string;

  /**
   * 修改类型(字典: 调班, 替班, 新增临时)
   */
  changeType?: string;

  /**
   * 修改人ID(操作修改的用户)
   */
  changedBy?: number;

  /**
   * 修改时间
   */
  changeTime?: string;

  /**
   * 备注(如:调班原因、替班说明等)
   */
  remark?: string;
}

export interface ScheduleModificationsQuery extends PageQuery {
  /**
   * 关联的排班记录ID(原排班表主键)
   */
  scheduleId?: number | string;

  /**
   * 原员工ID(修改前的排班员工)
   */
  originalUserId?: number | string;

  /**
   * 新员工ID(修改后的排班员工,change_type为'新增临时')
   */
  newUserId?: number | string;

  /**
   * 修改类型(字典: 调班, 替班, 新增临时)
   */
  changeType?: string;

  /**
   * 修改人ID(操作修改的用户)
   */
  changedBy?: number;

  /**
   * 修改时间
   */
  changeTime?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
