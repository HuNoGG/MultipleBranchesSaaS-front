import type { PageQuery, BaseEntity } from '#/api/common';

export interface StoresVO {
  /**
   * 分店唯一ID
   */
  id: string | number;

  /**
   * 分店名称
   */
  name: string;

  /**
   * 分店地址
   */
  address: string;

  /**
   * 跨日工时归属规则(字典: by_shift_start, by_calendar_day)
   */
  crossDayRule: string;

  /**
   * 状态(0正常1停用)
   */
  status: string;

  /**
   * 备注
   */
  remark: string;
}

export interface StoresForm extends BaseEntity {
  /**
   * 分店唯一ID
   */
  id?: string | number;

  /**
   * 分店名称
   */
  name?: string;

  /**
   * 分店地址
   */
  address?: string;

  /**
   * 跨日工时归属规则(字典: by_shift_start, by_calendar_day)
   */
  crossDayRule?: string;

  /**
   * 状态(0正常1停用)
   */
  status?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface StoresQuery extends PageQuery {
  /**
   * 分店名称
   */
  name?: string;

  /**
   * 分店地址
   */
  address?: string;

  /**
   * 跨日工时归属规则(字典: by_shift_start, by_calendar_day)
   */
  crossDayRule?: string;

  /**
   * 状态(0正常1停用)
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
