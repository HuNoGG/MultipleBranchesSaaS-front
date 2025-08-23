import type {
  InventoryTransfersForm,
  InventoryTransfersQuery,
  InventoryTransfersVO,
} from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询调货记录列表
 * @param params
 * @returns 调货记录列表
 */
export function inventoryTransfersList(params?: InventoryTransfersQuery) {
  return requestClient.get<PageResult<InventoryTransfersVO>>(
    '/hrp/inventoryTransfers/list',
    { params },
  );
}

/**
 * 导出调货记录列表
 * @param params
 * @returns 调货记录列表
 */
export function inventoryTransfersExport(params?: InventoryTransfersQuery) {
  return commonExport('/hrp/inventoryTransfers/export', params ?? {});
}

/**
 * 查询调货记录详情
 * @param id id
 * @returns 调货记录详情
 */
export function inventoryTransfersInfo(id: ID) {
  return requestClient.get<InventoryTransfersVO>(
    `/hrp/inventoryTransfers/${id}`,
  );
}

/**
 * 新增调货记录
 * @param data
 * @returns void
 */
export function inventoryTransfersAdd(data: InventoryTransfersForm) {
  return requestClient.postWithMsg<void>('/hrp/inventoryTransfers', data);
}

/**
 * 更新调货记录
 * @param data
 * @returns void
 */
export function inventoryTransfersUpdate(data: InventoryTransfersForm) {
  return requestClient.putWithMsg<void>('/hrp/inventoryTransfers', data);
}

/**
 * 删除调货记录
 * @param id id
 * @returns void
 */
export function inventoryTransfersRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/hrp/inventoryTransfers/${id}`);
}
