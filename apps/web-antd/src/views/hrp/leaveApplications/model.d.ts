import type { BaseEntity, PageQuery } from '#/api/common';

export interface LeaveApplicationsVO {
  /**
   * 申请 ID
   */
  id: number | string;

  /**
   * 申请人ID(关联系统用户表)
   */
  userId: number | string;

  /**
   * 请假类型(如:事假,病假,年假,婚假)
   */
  leaveType: string;

  /**
   * 请假开始时间(精确到时分)
   */
  startTime: string;

  /**
   * 请假结束时间(精确到时分)
   */
  endTime: string;

  /**
   * 请假天数(自动计算,支持0.5天粒度)
   */
  leaveDays: number;

  /**
   * 请假事由
   */
  reason: string;

  /**
   * 附件链接(如病假证明、休假凭证)
   */
  attachmentUrl: string;

  /**
   * 审批状态(字典: 待审批, 已批准, 已驳回)
   */
  approvalStatus: string;

  /**
   * 审批人ID(关联系统用户表,审批后生效)
   */
  approvedBy: number;

  /**
   * 数据状态(0正常1停用/作废)
   */
  status: string;

  /**
   * 备注(如审批意见、特殊说明)
   */
  remark: string;
}

export interface LeaveApplicationsForm extends BaseEntity {
  /**
   * 申请 ID
   */
  id?: number | string;

  /**
   * 申请人ID(关联系统用户表)
   */
  userId?: number | string;

  /**
   * 请假类型(如:事假,病假,年假,婚假)
   */
  leaveType?: string;

  /**
   * 请假开始时间(精确到时分)
   */
  startTime?: string;

  /**
   * 请假结束时间(精确到时分)
   */
  endTime?: string;

  /**
   * 请假天数(自动计算,支持0.5天粒度)
   */
  leaveDays?: number;

  /**
   * 请假事由
   */
  reason?: string;

  /**
   * 附件链接(如病假证明、休假凭证)
   */
  attachmentUrl?: string;

  /**
   * 审批状态(字典: 待审批, 已批准, 已驳回)
   */
  approvalStatus?: string;

  /**
   * 审批人ID(关联系统用户表,审批后生效)
   */
  approvedBy?: number;

  /**
   * 数据状态(0正常1停用/作废)
   */
  status?: string;

  /**
   * 备注(如审批意见、特殊说明)
   */
  remark?: string;
}

export interface LeaveApplicationsQuery extends PageQuery {
  /**
   * 申请人ID(关联系统用户表)
   */
  userId?: number | string;

  /**
   * 请假类型(如:事假,病假,年假,婚假)
   */
  leaveType?: string;

  /**
   * 请假开始时间(精确到时分)
   */
  startTime?: string;

  /**
   * 请假结束时间(精确到时分)
   */
  endTime?: string;

  /**
   * 请假天数(自动计算,支持0.5天粒度)
   */
  leaveDays?: number;

  /**
   * 请假事由
   */
  reason?: string;

  /**
   * 附件链接(如病假证明、休假凭证)
   */
  attachmentUrl?: string;

  /**
   * 审批状态(字典: 待审批, 已批准, 已驳回)
   */
  approvalStatus?: string;

  /**
   * 审批人ID(关联系统用户表,审批后生效)
   */
  approvedBy?: number;

  /**
   * 数据状态(0正常1停用/作废)
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
