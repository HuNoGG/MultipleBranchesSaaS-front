import type { PageQuery, BaseEntity } from '#/api/common';

export interface UserStoreAccessVO {
  /**
   * 员工 ID
   */
  userId: string | number;

  /**
   * 授权支援的分店 ID
   */
  storeId: string | number;
}

export interface UserStoreAccessForm extends BaseEntity {
  /**
   * 员工 ID
   */
  userId?: string | number;

  /**
   * 授权支援的分店 ID
   */
  storeId?: string | number;
}

export interface UserStoreAccessQuery extends PageQuery {
  /**
   * 日期范围参数
   */
  params?: any;
}
