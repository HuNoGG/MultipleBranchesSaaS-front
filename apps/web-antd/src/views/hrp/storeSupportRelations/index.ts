import type {
  StoreSupportRelationsVO,
  StoreSupportRelationsForm,
  StoreSupportRelationsQuery,
} from './model';

import type { ID, IDS } from '#/api/common';
import type { PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询分店支援关系列表
 * @param params
 * @returns 分店支援关系列表
 */
export function storeSupportRelationsList(params?: StoreSupportRelationsQuery) {
  return requestClient.get<PageResult<StoreSupportRelationsVO>>(
    '/hrp/storeSupportRelations/list',
    { params },
  );
}

/**
 * 导出分店支援关系列表
 * @param params
 * @returns 分店支援关系列表
 */
export function storeSupportRelationsExport(
  params?: StoreSupportRelationsQuery,
) {
  return commonExport('/hrp/storeSupportRelations/export', params ?? {});
}

/**
 * 查询分店支援关系详情
 * @param requestingStoreId id
 * @returns 分店支援关系详情
 */
export function storeSupportRelationsInfo(requestingStoreId: ID) {
  return requestClient.get<StoreSupportRelationsVO>(
    `/hrp/storeSupportRelations/${requestingStoreId}`,
  );
}

/**
 * 新增分店支援关系
 * @param data
 * @returns void
 */
export function storeSupportRelationsAdd(data: StoreSupportRelationsForm) {
  return requestClient.postWithMsg<void>('/hrp/storeSupportRelations', data);
}

/**
 * 更新分店支援关系
 * @param data
 * @returns void
 */
export function storeSupportRelationsUpdate(data: StoreSupportRelationsForm) {
  return requestClient.putWithMsg<void>('/hrp/storeSupportRelations', data);
}

/**
 * 删除分店支援关系
 * @param requestingStoreId id
 * @returns void
 */
export function storeSupportRelationsRemove(requestingStoreId: ID | IDS) {
  return requestClient.deleteWithMsg<void>(
    `/hrp/storeSupportRelations/${requestingStoreId}`,
  );
}
