import type { BaseEntity, PageQuery } from '#/api/common';

export interface InventoryTransfersVO {
  /**
   * 调货单 ID
   */
  id: number | string;

  /**
   * 申请方分店ID (A分店)
   */
  requestStoreId: number | string;

  /**
   * 提供方分店ID(B分店)
   */
  providerStoreId: number | string;

  /**
   * 申请人ID
   */
  requestUserId: number | string;

  /**
   * 调货内容(品项,数量)示例:[{"item":"商品A","qty":10}]
   */
  transferDetails: string;

  /**
   * 状态(字典: 待审核, 待确认, 已完成)
   */
  approvalStatus: string;

  /**
   * 申请方确认时间
   */
  requestConfirmedAt: string;

  /**
   * 提供方确认时间
   */
  providerConfirmedAt: number | string;

  /**
   * 该班次责任人ID
   */
  responsibleUserId: number | string;

  /**
   * 状态(0正常1停用)
   */
  status: string;

  /**
   * 备注
   */
  remark: string;
}

export interface InventoryTransfersForm extends BaseEntity {
  /**
   * 调货单 ID
   */
  id?: number | string;

  /**
   * 申请方分店ID (A分店)
   */
  requestStoreId?: number | string;

  /**
   * 提供方分店ID(B分店)
   */
  providerStoreId?: number | string;

  /**
   * 申请人ID
   */
  requestUserId?: number | string;

  /**
   * 调货内容(品项,数量)示例:[{"item":"商品A","qty":10}]
   */
  transferDetails?: string;

  /**
   * 状态(字典: 待审核, 待确认, 已完成)
   */
  approvalStatus?: string;

  /**
   * 申请方确认时间
   */
  requestConfirmedAt?: string;

  /**
   * 提供方确认时间
   */
  providerConfirmedAt?: number | string;

  /**
   * 该班次责任人ID
   */
  responsibleUserId?: number | string;

  /**
   * 状态(0正常1停用)
   */
  status?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface InventoryTransfersQuery extends PageQuery {
  /**
   * 申请方分店ID (A分店)
   */
  requestStoreId?: number | string;

  /**
   * 提供方分店ID(B分店)
   */
  providerStoreId?: number | string;

  /**
   * 申请人ID
   */
  requestUserId?: number | string;

  /**
   * 调货内容(品项,数量)示例:[{"item":"商品A","qty":10}]
   */
  transferDetails?: string;

  /**
   * 状态(字典: 待审核, 待确认, 已完成)
   */
  approvalStatus?: string;

  /**
   * 申请方确认时间
   */
  requestConfirmedAt?: string;

  /**
   * 提供方确认时间
   */
  providerConfirmedAt?: number | string;

  /**
   * 该班次责任人ID
   */
  responsibleUserId?: number | string;

  /**
   * 状态(0正常1停用)
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
