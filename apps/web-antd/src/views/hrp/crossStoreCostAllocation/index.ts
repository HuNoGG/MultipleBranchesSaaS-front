import type {
  CrossStoreCostAllocationForm,
  CrossStoreCostAllocationQuery,
  CrossStoreCostAllocationVO,
} from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询跨店成本分摊设定列表
 * @param params
 * @returns 跨店成本分摊设定列表
 */
export function crossStoreCostAllocationList(
  params?: CrossStoreCostAllocationQuery,
) {
  return requestClient.get<PageResult<CrossStoreCostAllocationVO>>(
    '/hrp/crossStoreCostAllocation/list',
    { params },
  );
}

/**
 * 导出跨店成本分摊设定列表
 * @param params
 * @returns 跨店成本分摊设定列表
 */
export function crossStoreCostAllocationExport(
  params?: CrossStoreCostAllocationQuery,
) {
  return commonExport('/hrp/crossStoreCostAllocation/export', params ?? {});
}

/**
 * 查询跨店成本分摊设定详情
 * @param id id
 * @returns 跨店成本分摊设定详情
 */
export function crossStoreCostAllocationInfo(id: ID) {
  return requestClient.get<CrossStoreCostAllocationVO>(
    `/hrp/crossStoreCostAllocation/${id}`,
  );
}

/**
 * 新增跨店成本分摊设定
 * @param data
 * @returns void
 */
export function crossStoreCostAllocationAdd(
  data: CrossStoreCostAllocationForm,
) {
  return requestClient.postWithMsg<void>('/hrp/crossStoreCostAllocation', data);
}

/**
 * 更新跨店成本分摊设定
 * @param data
 * @returns void
 */
export function crossStoreCostAllocationUpdate(
  data: CrossStoreCostAllocationForm,
) {
  return requestClient.putWithMsg<void>('/hrp/crossStoreCostAllocation', data);
}

/**
 * 删除跨店成本分摊设定
 * @param id id
 * @returns void
 */
export function crossStoreCostAllocationRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(
    `/hrp/crossStoreCostAllocation/${id}`,
  );
}
