import type { BaseEntity, PageQuery } from '#/api/common';

export interface CrossStoreCostAllocationVO {
  /**
   * 唯一ID
   */
  id: number | string;

  /**
   * 员工 ID
   */
  userId: number | string;

  /**
   * 分摊方式(字典: 依时数, 依比例)
   */
  allocationType: string;

  /**
   * 分摊规则 示例:{"storeA": 50, "storeB":50} (比例分摊)
   */
  allocationRules: string;

  /**
   * 状态(0正常1停用)
   */
  status: string;

  /**
   * 备注
   */
  remark: string;
}

export interface CrossStoreCostAllocationForm extends BaseEntity {
  /**
   * 唯一ID
   */
  id?: number | string;

  /**
   * 员工 ID
   */
  userId?: number | string;

  /**
   * 分摊方式(字典: 依时数, 依比例)
   */
  allocationType?: string;

  /**
   * 分摊规则 示例:{"storeA": 50, "storeB":50} (比例分摊)
   */
  allocationRules?: string;

  /**
   * 状态(0正常1停用)
   */
  status?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface CrossStoreCostAllocationQuery extends PageQuery {
  /**
   * 员工 ID
   */
  userId?: number | string;

  /**
   * 分摊方式(字典: 依时数, 依比例)
   */
  allocationType?: string;

  /**
   * 分摊规则 示例:{"storeA": 50, "storeB":50} (比例分摊)
   */
  allocationRules?: string;

  /**
   * 状态(0正常1停用)
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
