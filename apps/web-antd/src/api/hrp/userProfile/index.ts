import type { UserProfileForm, UserProfileQuery, UserProfileVO } from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询员工档案扩展列表
 * @param params
 * @returns 员工档案扩展列表
 */
export function userProfileList(params?: UserProfileQuery) {
  return requestClient.get<PageResult<UserProfileVO>>('/hrp/userProfile/list', {
    params,
  });
}

/**
 * 获取当前店铺所有的员工与技能信息
 * @param params
 * @returns 员工档案扩展列表
 */
export function listUserprofileWithSkills(params?: UserProfileQuery) {
  return requestClient.get<Array<UserProfileVO>>(
    '/hrp/userProfile/listWithSkills',
    {
      params,
    },
  );
}

/**
 * 获取当前店铺所有的员工与技能信息
 * @param params
 * @returns 员工档案扩展列表
 */
export function getAvailableSubstitutes(params?: UserProfileQuery) {
  return requestClient.get<Array<UserProfileVO>>(
    '/hrp/userProfile/available-substitutes',
    {
      params,
    },
  );
}

/**
 * 导出员工档案扩展列表
 * @param params
 * @returns 员工档案扩展列表
 */
export function userProfileExport(params?: UserProfileQuery) {
  return commonExport('/hrp/userProfile/export', params ?? {});
}

/**
 * 查询员工档案扩展详情
 * @param userId id
 * @returns 员工档案扩展详情
 */
export function userProfileInfo(userId: ID) {
  return requestClient.get<UserProfileVO>(`/hrp/userProfile/${userId}`);
}

/**
 * 新增员工档案扩展
 * @param data
 * @returns void
 */
export function userProfileAdd(data: UserProfileForm) {
  return requestClient.postWithMsg<void>('/hrp/userProfile', data);
}

/**
 * 新增员工档案扩展
 * @param data
 * @returns void
 */
export function saveExtendedInfo(data: any) {
  return requestClient.put<void>('/hrp/userProfile/saveExtendedInfo', data);
}

/**
 * 更新员工档案扩展
 * @param data
 * @returns void
 */
export function userProfileUpdate(data: UserProfileForm) {
  return requestClient.putWithMsg<void>('/hrp/userProfile', data);
}

/**
 * 删除员工档案扩展
 * @param userId id
 * @returns void
 */
export function userProfileRemove(userId: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/hrp/userProfile/${userId}`);
}
