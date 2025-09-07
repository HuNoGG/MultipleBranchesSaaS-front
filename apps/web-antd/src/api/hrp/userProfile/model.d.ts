import type { BaseEntity, PageQuery } from '#/api/common';

export interface UserProfileVO {
  /**
   * 员工ID(关联系统用户表)
   */
  userId: number | string;

  /**
   * 员工分类
   */
  employeeType: string;

  /**
   * 分店 ID
   */
  mainStoreId: number | string;

  /**
   * 分配工作优先分数
   */
  priorityScore: number;

  /**
   * 状态(0在职1离职)
   */
  status: string;

  /**
   * 备注
   */
  remark: string;
}

export interface UserProfileForm extends BaseEntity {
  /**
   * 员工ID(关联系统用户表)
   */
  userId?: number | string;

  /**
   * 员工分类
   */
  employeeType?: string;

  /**
   * 分店 ID
   */
  mainStoreId?: number | string;

  /**
   * 分配工作优先分数
   */
  priorityScore?: number;

  /**
   * 状态(0在职1离职)
   */
  status?: string;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 休息日
   */
  restDays?: number[];
}

export interface UserProfileQuery extends PageQuery {
  /**
   * 员工分类
   */
  employeeType?: string;

  /**
   * 分店 ID
   */
  mainStoreId?: number | string;

  /**
   * 分配工作优先分数
   */
  priorityScore?: number;

  /**
   * 状态(0在职1离职)
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
