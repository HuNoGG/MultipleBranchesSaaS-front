import type { SkillsVO, SkillsForm, SkillsQuery } from './model';

import type { ID, IDS } from '#/api/common';
import type { PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询技能岗位列表
 * @param params
 * @returns 技能岗位列表
 */
export function skillsList(params?: SkillsQuery) {
  return requestClient.get<PageResult<SkillsVO>>('/hrp/skills/list', {
    params,
  });
}

/**
 * 导出技能岗位列表
 * @param params
 * @returns 技能岗位列表
 */
export function skillsExport(params?: SkillsQuery) {
  return commonExport('/hrp/skills/export', params ?? {});
}

/**
 * 查询技能岗位详情
 * @param id id
 * @returns 技能岗位详情
 */
export function skillsInfo(id: ID) {
  return requestClient.get<SkillsVO>(`/hrp/skills/${id}`);
}

/**
 * 新增技能岗位
 * @param data
 * @returns void
 */
export function skillsAdd(data: SkillsForm) {
  return requestClient.postWithMsg<void>('/hrp/skills', data);
}

/**
 * 更新技能岗位
 * @param data
 * @returns void
 */
export function skillsUpdate(data: SkillsForm) {
  return requestClient.putWithMsg<void>('/hrp/skills', data);
}

/**
 * 删除技能岗位
 * @param id id
 * @returns void
 */
export function skillsRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/hrp/skills/${id}`);
}
