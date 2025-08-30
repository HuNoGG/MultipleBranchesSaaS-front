// MOCK 数据

import type { User } from '#/api/system/user/model';

// ========== 数据模型定义 ==========

export interface Skill {
  id: string;
  name: string;
  description: string;
}

export interface SysUser {
  userId: string;
  userName: string;
  nickName: string;
  deptName: string;
}

export interface Employee {
  id: string;
  name: string;
  employeeId: string; // 工号
  type: '正职' | '兼职';
  status: '在职' | '离职';
  hireDate: string; // 入职日期
  skills: Skill[];
}

export interface Store {
  id: string;
  name: string;
  address: string;
  managerName: string;
  contactPhone: string;
  status: string;
  employeeCount: number;
  crossDayRule: string;
  remark: string;
}

// ========== MOCK 数据生成 ==========

export const getMockStores = (): Store[] => [
  {
    id: 'store-001',
    name: '未来科技城店',
    address: '科创路1号未来广场A座101',
    managerName: '张三',
    contactPhone: '13800138001',
    status: '营业中',
    employeeCount: 25,
  },
  {
    id: 'store-002',
    name: '文三路数字大厦店',
    address: '文三路99号数字信息大厦底商',
    managerName: '李四',
    contactPhone: '13900139002',
    status: '营业中',
    employeeCount: 18,
  },
  {
    id: 'store-003',
    name: '滨江物联网小镇店',
    address: '江南大道88号物联网产业园3号楼',
    managerName: '王五',
    contactPhone: '13700137003',
    status: '已关闭',
    employeeCount: 0,
  },
];

const mockSkills: Skill[] = [
  {
    id: 'skill-1',
    name: '收银',
    description: '熟练使用收银系统, 处理现金和电子支付',
  },
  { id: 'skill-2', name: '出锅', description: '负责菜品烹饪和出品' },
  { id: 'skill-3', name: '配菜', description: '负责菜品的准备和切配工作' },
  { id: 'skill-4', name: '清洁', description: '负责店面和后厨的清洁卫生' },
];

export const getMockEmployees = (storeId: string): Employee[] => {
  if (storeId === 'store-003') return [];
  return [
    {
      id: 'emp-01',
      name: '赵晓丽',
      employeeId: 'A001',
      type: '正职',
      status: '在职',
      hireDate: '2023-05-10',
      skills: [mockSkills[0], mockSkills[1]],
    },
    {
      id: 'emp-02',
      name: '钱文涛',
      employeeId: 'A002',
      type: '正职',
      status: '在职',
      hireDate: '2023-06-15',
      skills: [mockSkills[1], mockSkills[2]],
    },
    {
      id: 'emp-03',
      name: '孙琳',
      employeeId: 'B001',
      type: '兼职',
      status: '在职',
      hireDate: '2024-02-01',
      skills: [mockSkills[3]],
    },
    {
      id: 'emp-04',
      name: '周毅',
      employeeId: 'B002',
      type: '兼职',
      status: '离职',
      hireDate: '2023-11-20',
      skills: [mockSkills[0]],
    },
  ];
};

export const getMockSkills = (storeId: string): Skill[] => {
  return mockSkills;
};

// ========== TODO: #1 新增 - MOCK 数据生成 ==========
export const getMockUnassignedUsers = (): SysUser[] => [
  {
    userId: 'user-101',
    userName: 'admin',
    nickName: '超级管理员',
    deptName: '研发部',
  },
  { userId: 'user-102', userName: 'ry', nickName: '若依', deptName: '市场部' },
  {
    userId: 'user-103',
    userName: 'test',
    nickName: '测试员',
    deptName: '测试部',
  },
  {
    userId: 'user-104',
    userName: 'lisi',
    nickName: '李四',
    deptName: '销售部',
  },
];
