import type { BaseEntity, PageQuery } from '#/api/common';

export interface SkillsVO {
  /**
   * 技能唯一ID
   */
  id: number | string;

  /**
   * 技能名称(如: 出锅,带位)
   */
  name: string;

  /**
   * 状态(0正常1停用)
   */
  status: string;

  /**
   * 备注
   */
  remark: string;
}

export interface SkillsForm extends BaseEntity {
  /**
   * 技能唯一ID
   */
  id?: number | string;

  /**
   * 技能名称(如: 出锅,带位)
   */
  name?: string;

  /**
   * 状态(0正常1停用)
   */
  status?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface SkillsQuery extends PageQuery {
  /**
   * 技能名称(如: 出锅,带位)
   */
  name?: string;

  /**
   * 状态(0正常1停用)
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
