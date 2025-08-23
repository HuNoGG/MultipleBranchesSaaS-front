import type { StoreEventsForm, StoreEventsQuery, StoreEventsVO } from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询分店特殊事件列表
 * @param params
 * @returns 分店特殊事件列表
 */
export function storeEventsList(params?: StoreEventsQuery) {
  return requestClient.get<PageResult<StoreEventsVO>>('/hrp/storeEvents/list', {
    params,
  });
}

/**
 * 导出分店特殊事件列表
 * @param params
 * @returns 分店特殊事件列表
 */
export function storeEventsExport(params?: StoreEventsQuery) {
  return commonExport('/hrp/storeEvents/export', params ?? {});
}

/**
 * 查询分店特殊事件详情
 * @param id id
 * @returns 分店特殊事件详情
 */
export function storeEventsInfo(id: ID) {
  return requestClient.get<StoreEventsVO>(`/hrp/storeEvents/${id}`);
}

/**
 * 新增分店特殊事件
 * @param data
 * @returns void
 */
export function storeEventsAdd(data: StoreEventsForm) {
  return requestClient.postWithMsg<void>('/hrp/storeEvents', data);
}

/**
 * 更新分店特殊事件
 * @param data
 * @returns void
 */
export function storeEventsUpdate(data: StoreEventsForm) {
  return requestClient.putWithMsg<void>('/hrp/storeEvents', data);
}

/**
 * 删除分店特殊事件
 * @param id id
 * @returns void
 */
export function storeEventsRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/hrp/storeEvents/${id}`);
}
