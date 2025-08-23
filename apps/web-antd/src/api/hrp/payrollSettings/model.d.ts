import type { BaseEntity, PageQuery } from '#/api/common';

export interface PayrollSettingsVO {
  /**
   * 规则 ID
   */
  id: number | string;

  /**
   * 员工 ID
   */
  userId: number | string;

  /**
   * 月薪(全职适用)
   */
  baseSalary: number;

  /**
   * 时薪(计时适用)
   */
  hourlyRate: number;

  /**
   * 生效日期
   */
  effectiveDate: string;

  /**
   * 状态(0正常1停用)
   */
  status: string;

  /**
   * 备注
   */
  remark: string;
}

export interface PayrollSettingsForm extends BaseEntity {
  /**
   * 规则 ID
   */
  id?: number | string;

  /**
   * 员工 ID
   */
  userId?: number | string;

  /**
   * 月薪(全职适用)
   */
  baseSalary?: number;

  /**
   * 时薪(计时适用)
   */
  hourlyRate?: number;

  /**
   * 生效日期
   */
  effectiveDate?: string;

  /**
   * 状态(0正常1停用)
   */
  status?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface PayrollSettingsQuery extends PageQuery {
  /**
   * 员工 ID
   */
  userId?: number | string;

  /**
   * 月薪(全职适用)
   */
  baseSalary?: number;

  /**
   * 时薪(计时适用)
   */
  hourlyRate?: number;

  /**
   * 生效日期
   */
  effectiveDate?: string;

  /**
   * 状态(0正常1停用)
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
