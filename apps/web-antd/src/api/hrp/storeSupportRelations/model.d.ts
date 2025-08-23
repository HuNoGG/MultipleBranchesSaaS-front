import type { BaseEntity, PageQuery } from '#/api/common';

export interface StoreSupportRelationsVO {
  /**
   * 请求支援的分店ID
   */
  requestingStoreId: number | string;

  /**
   * 可提供支援的分店 ID
   */
  supportingStoreId: number | string;
}

export interface StoreSupportRelationsForm extends BaseEntity {
  /**
   * 请求支援的分店ID
   */
  requestingStoreId?: number | string;

  /**
   * 可提供支援的分店 ID
   */
  supportingStoreId?: number | string;
}

export interface StoreSupportRelationsQuery extends PageQuery {
  /**
   * 日期范围参数
   */
  params?: any;
}
