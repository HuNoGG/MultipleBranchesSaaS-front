import type { StoresForm, StoresQuery, StoresVO } from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询分店列表
 * @param params
 * @returns 分店列表
 */
export function storesList(params?: StoresQuery) {
  return requestClient.get<PageResult<StoresVO>>('/hrp/stores/list', {
    params,
  });
}

/**
 * 导出分店列表
 * @param params
 * @returns 分店列表
 */
export function storesExport(params?: StoresQuery) {
  return commonExport('/hrp/stores/export', params ?? {});
}

/**
 * 查询分店详情
 * @param id id
 * @returns 分店详情
 */
export function storesInfo(id: ID) {
  return requestClient.get<StoresVO>(`/hrp/stores/${id}`);
}

/**
 * 新增分店
 * @param data
 * @returns void
 */
export function storesAdd(data: StoresForm) {
  return requestClient.post<void>('/hrp/stores', data);
}

/**
 * 更新分店
 * @param data
 * @returns void
 */
export function storesUpdate(data: StoresForm) {
  return requestClient.put<void>('/hrp/stores', data);
}

/**
 * 删除分店
 * @param id id
 * @returns void
 */
export function storesRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/hrp/stores/${id}`);
}
