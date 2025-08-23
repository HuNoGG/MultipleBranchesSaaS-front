import type {
  UserStoreAccessForm,
  UserStoreAccessQuery,
  UserStoreAccessVO,
} from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询员工跨店权限列表
 * @param params
 * @returns 员工跨店权限列表
 */
export function userStoreAccessList(params?: UserStoreAccessQuery) {
  return requestClient.get<PageResult<UserStoreAccessVO>>(
    '/hrp/userStoreAccess/list',
    { params },
  );
}

/**
 * 导出员工跨店权限列表
 * @param params
 * @returns 员工跨店权限列表
 */
export function userStoreAccessExport(params?: UserStoreAccessQuery) {
  return commonExport('/hrp/userStoreAccess/export', params ?? {});
}

/**
 * 查询员工跨店权限详情
 * @param userId id
 * @returns 员工跨店权限详情
 */
export function userStoreAccessInfo(userId: ID) {
  return requestClient.get<UserStoreAccessVO>(`/hrp/userStoreAccess/${userId}`);
}

/**
 * 新增员工跨店权限
 * @param data
 * @returns void
 */
export function userStoreAccessAdd(data: UserStoreAccessForm) {
  return requestClient.postWithMsg<void>('/hrp/userStoreAccess', data);
}

/**
 * 更新员工跨店权限
 * @param data
 * @returns void
 */
export function userStoreAccessUpdate(data: UserStoreAccessForm) {
  return requestClient.putWithMsg<void>('/hrp/userStoreAccess', data);
}

/**
 * 删除员工跨店权限
 * @param userId id
 * @returns void
 */
export function userStoreAccessRemove(userId: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/hrp/userStoreAccess/${userId}`);
}
