import type { PageQuery, BaseEntity } from '#/api/common';

export interface ShiftsVO {
  /**
   * 班别唯一ID
   */
  id: string | number;

  /**
   * 所属分店 ID
   */
  storeId: string | number;

  /**
   * 班别名称(如:早班)
   */
  name: string;

  /**
   * 班别代码(如:早)
   */
  code: string;

  /**
   * 开始时间
   */
  startTime: string;

  /**
   * 结束时间
   */
  endTime: string;

  /**
   * 是否跨日(TRUE =是,FALSE =否)
   */
  isCrossDay: number;

  /**
   * 班表显示颜色(如:#FF5733)
   */
  colorCode: string;

  /**
   * 状态(0正常1停用)
   */
  status: string;

  /**
   * 备注
   */
  remark: string;
}

export interface ShiftsForm extends BaseEntity {
  /**
   * 班别唯一ID
   */
  id?: string | number;

  /**
   * 所属分店 ID
   */
  storeId?: string | number;

  /**
   * 班别名称(如:早班)
   */
  name?: string;

  /**
   * 班别代码(如:早)
   */
  code?: string;

  /**
   * 开始时间
   */
  startTime?: string;

  /**
   * 结束时间
   */
  endTime?: string;

  /**
   * 是否跨日(TRUE =是,FALSE =否)
   */
  isCrossDay?: number;

  /**
   * 班表显示颜色(如:#FF5733)
   */
  colorCode?: string;

  /**
   * 状态(0正常1停用)
   */
  status?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface ShiftsQuery extends PageQuery {
  /**
   * 所属分店 ID
   */
  storeId?: string | number;

  /**
   * 班别名称(如:早班)
   */
  name?: string;

  /**
   * 班别代码(如:早)
   */
  code?: string;

  /**
   * 开始时间
   */
  startTime?: string;

  /**
   * 结束时间
   */
  endTime?: string;

  /**
   * 是否跨日(TRUE =是,FALSE =否)
   */
  isCrossDay?: number;

  /**
   * 班表显示颜色(如:#FF5733)
   */
  colorCode?: string;

  /**
   * 状态(0正常1停用)
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
