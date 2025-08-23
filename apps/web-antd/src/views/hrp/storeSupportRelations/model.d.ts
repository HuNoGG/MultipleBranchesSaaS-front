import type { PageQuery, BaseEntity } from '#/api/common';

export interface StoreSupportRelationsVO {
  /**
   * 请求支援的分店ID
   */
  requestingStoreId: string | number;

  /**
   * 可提供支援的分店 ID
   */
  supportingStoreId: string | number;
}

export interface StoreSupportRelationsForm extends BaseEntity {
  /**
   * 请求支援的分店ID
   */
  requestingStoreId?: string | number;

  /**
   * 可提供支援的分店 ID
   */
  supportingStoreId?: string | number;
}

export interface StoreSupportRelationsQuery extends PageQuery {
  /**
   * 日期范围参数
   */
  params?: any;
}
