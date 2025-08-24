import type { UserSkillsForm, UserSkillsQuery, UserSkillsVO } from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询员工技能关联列表
 * @param params
 * @returns 员工技能关联列表
 */
export function userSkillsList(params?: UserSkillsQuery) {
  return requestClient.get<PageResult<UserSkillsVO>>('/hrp/userSkills/list', {
    params,
  });
}

/**
 * 导出员工技能关联列表
 * @param params
 * @returns 员工技能关联列表
 */
export function userSkillsExport(params?: UserSkillsQuery) {
  return commonExport('/hrp/userSkills/export', params ?? {});
}

/**
 * 查询员工技能关联详情
 * @param userId id
 * @returns 员工技能关联详情
 */
export function userSkillsInfo(userId: ID) {
  return requestClient.get<UserSkillsVO>(`/hrp/userSkills/${userId}`);
}

/**
 * 新增员工技能关联
 * @param data
 * @returns void
 */
export function addUserSkill(data: UserSkillsForm) {
  return requestClient.post<void>('/hrp/userSkills', data);
}

/**
 * 更新员工技能关联
 * @param data
 * @returns void
 */
export function userSkillsUpdate(data: UserSkillsForm) {
  return requestClient.putWithMsg<void>('/hrp/userSkills', data);
}

/**
 * 删除员工技能关联
 * @param userId id
 * @returns void
 */
export function removeUserSkill(params: any) {
  return requestClient.delete<void>(`/hrp/userSkills`, {
    params,
  });
}
