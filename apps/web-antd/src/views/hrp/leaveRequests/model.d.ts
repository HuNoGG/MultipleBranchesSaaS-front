import type { BaseEntity, PageQuery } from '#/api/common';

export interface LeaveRequestsVO {
  /**
   * 唯一ID
   */
  id: number | string;

  /**
   * 员工 ID
   */
  userId: number | string;

  /**
   * 期望休假日期
   */
  leaveDate: string;

  /**
   * 状态(字典: 已提交, 已锁定, 已取消)
   */
  approvalStatus: string;

  /**
   * 状态(0正常1停用)
   */
  status: string;

  /**
   * 备注
   */
  remark: string;
}

export interface LeaveRequestsForm extends BaseEntity {
  /**
   * 唯一ID
   */
  id?: number | string;

  /**
   * 员工 ID
   */
  userId?: number | string;

  /**
   * 期望休假日期
   */
  leaveDate?: string;

  /**
   * 状态(字典: 已提交, 已锁定, 已取消)
   */
  approvalStatus?: string;

  /**
   * 状态(0正常1停用)
   */
  status?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface LeaveRequestsQuery extends PageQuery {
  /**
   * 员工 ID
   */
  userId?: number | string;

  /**
   * 期望休假日期
   */
  leaveDate?: string;

  /**
   * 状态(字典: 已提交, 已锁定, 已取消)
   */
  approvalStatus?: string;

  /**
   * 状态(0正常1停用)
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
