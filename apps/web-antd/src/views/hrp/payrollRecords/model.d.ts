import type { BaseEntity, PageQuery } from '#/api/common';

export interface PayrollRecordsVO {
  /**
   * 薪资单 ID
   */
  id: number | string;

  /**
   * 员工 ID
   */
  userId: number | string;

  /**
   * 薪资周期开始
   */
  payPeriodStart: string;

  /**
   * 薪资周期结束
   */
  payPeriodEnd: string;

  /**
   * 总工时
   */
  totalHours: number;

  /**
   * 基本薪资
   */
  basePay: number;

  /**
   * 加班费
   */
  overtimePay: number;

  /**
   * 扣款
   */
  deductions: number;

  /**
   * 最终薪资
   */
  finalSalary: number;

  /**
   * 是否已确认(TRUE =是,FALSE = 否)
   */
  isFinalized: number;

  /**
   * 状态(0正常1停用)
   */
  status: string;

  /**
   * 备注
   */
  remark: string;
}

export interface PayrollRecordsForm extends BaseEntity {
  /**
   * 薪资单 ID
   */
  id?: number | string;

  /**
   * 员工 ID
   */
  userId?: number | string;

  /**
   * 薪资周期开始
   */
  payPeriodStart?: string;

  /**
   * 薪资周期结束
   */
  payPeriodEnd?: string;

  /**
   * 总工时
   */
  totalHours?: number;

  /**
   * 基本薪资
   */
  basePay?: number;

  /**
   * 加班费
   */
  overtimePay?: number;

  /**
   * 扣款
   */
  deductions?: number;

  /**
   * 最终薪资
   */
  finalSalary?: number;

  /**
   * 是否已确认(TRUE =是,FALSE = 否)
   */
  isFinalized?: number;

  /**
   * 状态(0正常1停用)
   */
  status?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface PayrollRecordsQuery extends PageQuery {
  /**
   * 员工 ID
   */
  userId?: number | string;

  /**
   * 薪资周期开始
   */
  payPeriodStart?: string;

  /**
   * 薪资周期结束
   */
  payPeriodEnd?: string;

  /**
   * 总工时
   */
  totalHours?: number;

  /**
   * 基本薪资
   */
  basePay?: number;

  /**
   * 加班费
   */
  overtimePay?: number;

  /**
   * 扣款
   */
  deductions?: number;

  /**
   * 最终薪资
   */
  finalSalary?: number;

  /**
   * 是否已确认(TRUE =是,FALSE = 否)
   */
  isFinalized?: number;

  /**
   * 状态(0正常1停用)
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
