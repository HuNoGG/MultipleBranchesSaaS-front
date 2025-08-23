import type { PageQuery, BaseEntity } from '#/api/common';

export interface UserSkillsVO {
  /**
   * 员工 ID
   */
  userId: string | number;

  /**
   * 技能 ID
   */
  skillId: string | number;
}

export interface UserSkillsForm extends BaseEntity {
  /**
   * 员工 ID
   */
  userId?: string | number;

  /**
   * 技能 ID
   */
  skillId?: string | number;
}

export interface UserSkillsQuery extends PageQuery {
  /**
   * 日期范围参数
   */
  params?: any;
}
