import type { BaseEntity, PageQuery } from '#/api/common';

export interface AttendanceExceptionsVO {
  /**
   * 异常记录 ID
   */
  id: number | string;

  /**
   * 员工 ID
   */
  userId: number | string;

  /**
   * 异常日期
   */
  exceptionDate: string;

  /**
   * 异常类型(字典: 忘记打卡, 迟到未请假, 早退未请假, 缺勤)
   */
  exceptionType: string;

  /**
   * 原始打卡(上班)
   */
  originalClockIn: string;

  /**
   * 原始打卡(下班)
   */
  originalClockOut: string;

  /**
   * 修正后打卡(上班)
   */
  correctedClockIn: string;

  /**
   * 修正后打卡(下班)
   */
  correctedClockOut: string;

  /**
   * 状态(字典: 待处理, 已修正)
   */
  approvalStatus: string;

  /**
   * 审核人 ID
   */
  approvedBy: number;

  /**
   * 状态(0正常1停用)
   */
  status: string;

  /**
   * 备注
   */
  remark: string;
}

export interface AttendanceExceptionsForm extends BaseEntity {
  /**
   * 异常记录 ID
   */
  id?: number | string;

  /**
   * 员工 ID
   */
  userId?: number | string;

  /**
   * 异常日期
   */
  exceptionDate?: string;

  /**
   * 异常类型(字典: 忘记打卡, 迟到未请假, 早退未请假, 缺勤)
   */
  exceptionType?: string;

  /**
   * 原始打卡(上班)
   */
  originalClockIn?: string;

  /**
   * 原始打卡(下班)
   */
  originalClockOut?: string;

  /**
   * 修正后打卡(上班)
   */
  correctedClockIn?: string;

  /**
   * 修正后打卡(下班)
   */
  correctedClockOut?: string;

  /**
   * 状态(字典: 待处理, 已修正)
   */
  approvalStatus?: string;

  /**
   * 审核人 ID
   */
  approvedBy?: number;

  /**
   * 状态(0正常1停用)
   */
  status?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface AttendanceExceptionsQuery extends PageQuery {
  /**
   * 员工 ID
   */
  userId?: number | string;

  /**
   * 异常日期
   */
  exceptionDate?: string;

  /**
   * 异常类型(字典: 忘记打卡, 迟到未请假, 早退未请假, 缺勤)
   */
  exceptionType?: string;

  /**
   * 原始打卡(上班)
   */
  originalClockIn?: string;

  /**
   * 原始打卡(下班)
   */
  originalClockOut?: string;

  /**
   * 修正后打卡(上班)
   */
  correctedClockIn?: string;

  /**
   * 修正后打卡(下班)
   */
  correctedClockOut?: string;

  /**
   * 状态(字典: 待处理, 已修正)
   */
  approvalStatus?: string;

  /**
   * 审核人 ID
   */
  approvedBy?: number;

  /**
   * 状态(0正常1停用)
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
