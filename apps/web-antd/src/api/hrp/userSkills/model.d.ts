import type { BaseEntity, PageQuery } from '#/api/common';

export interface UserSkillsVO {
  /**
   * 员工 ID
   */
  userId: number | string;

  /**
   * 技能 ID
   */
  skillId: number | string;
}

export interface UserSkillsForm extends BaseEntity {
  /**
   * 员工 ID
   */
  userId?: number | string;

  /**
   * 技能 ID
   */
  skillId?: number | string;

  /**
   * 技能分数
   */
  priority?: number;
}

export interface UserSkillsQuery extends PageQuery {
  /**
   * 日期范围参数
   */
  params?: any;
}
