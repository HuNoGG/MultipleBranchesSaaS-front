import type { BaseEntity, PageQuery } from '#/api/common';

export interface StoreEventsVO {
  /**
   * 事件ID
   */
  id: number | string;

  /**
   * 分店 ID (关联分店表)
   */
  storeId: number | string;

  /**
   * 事件日期
   */
  eventDate: string;

  /**
   * 事件类型(字典: 全天放假, 上午放假, 下午放假)
   */
  eventType: string;

  /**
   * 事件描述(如:法定节假日放假、设备检修)
   */
  description: string;
}

export interface StoreEventsForm extends BaseEntity {
  /**
   * 事件ID
   */
  id?: number | string;

  /**
   * 分店 ID (关联分店表)
   */
  storeId?: number | string;

  /**
   * 事件日期
   */
  eventDate?: string;

  /**
   * 事件类型(字典: 全天放假, 上午放假, 下午放假)
   */
  eventType?: string;

  /**
   * 事件描述(如:法定节假日放假、设备检修)
   */
  description?: string;
}

export interface StoreEventsQuery extends PageQuery {
  /**
   * 分店 ID (关联分店表)
   */
  storeId?: number | string;

  /**
   * 事件日期
   */
  eventDate?: string;

  /**
   * 事件类型(字典: 全天放假, 上午放假, 下午放假)
   */
  eventType?: string;

  /**
   * 事件描述(如:法定节假日放假、设备检修)
   */
  description?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
