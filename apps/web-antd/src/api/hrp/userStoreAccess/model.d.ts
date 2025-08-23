import type { BaseEntity, PageQuery } from '#/api/common';

export interface UserStoreAccessVO {
  /**
   * 员工 ID
   */
  userId: number | string;

  /**
   * 授权支援的分店 ID
   */
  storeId: number | string;
}

export interface UserStoreAccessForm extends BaseEntity {
  /**
   * 员工 ID
   */
  userId?: number | string;

  /**
   * 授权支援的分店 ID
   */
  storeId?: number | string;
}

export interface UserStoreAccessQuery extends PageQuery {
  /**
   * 日期范围参数
   */
  params?: any;
}
