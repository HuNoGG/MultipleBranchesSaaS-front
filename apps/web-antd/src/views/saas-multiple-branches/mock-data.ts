// MOCK
// 定义数据结构, 为复杂的替班场景做准备
export interface Substitute {
  id: string;
  employeeId: string;
  employeeName: string;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

export interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  skillName: string;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  type: 'morning' | 'evening' | 'night'; // 用于决定颜色
  substitutes?: Substitute[]; // 替班信息, 可以有多个
}

export interface ScheduleDay {
  date: string; // "YYYY-MM-DD"
  shifts: Shift[];
  isDayOff?: boolean;
}

export interface EmployeeSchedule {
  employeeId: string;
  employeeName: string;
  employeeType: '正职' | '兼职';
  days: ScheduleDay[];
}

// 生成MOCK数据
export const getMockScheduleData = (): EmployeeSchedule[] => {
  return [
    {
      employeeId: 'emp-001',
      employeeName: '员工 A',
      employeeType: '正职',
      days: [
        {
          date: '2025-08-29',
          shifts: [
            {
              id: 'shift-01',
              employeeId: 'emp-001',
              employeeName: '员工 A',
              skillName: '出锅',
              startTime: '09:00',
              endTime: '18:00',
              type: 'morning',
              substitutes: [
                // TODO: 员工A的班次中, 包含一个替班记录
                {
                  id: 'sub-01',
                  employeeId: 'emp-002',
                  employeeName: '员工 B',
                  startTime: '13:00',
                  endTime: '14:00',
                },
              ],
            },
          ],
        },
        {
          date: '2025-08-30',
          shifts: [
            {
              id: 'shift-02',
              employeeId: 'emp-001',
              employeeName: '员工 A',
              skillName: '收银',
              startTime: '18:00',
              endTime: '23:00',
              type: 'evening',
            },
          ],
        },
        {
          date: '2025-08-31',
          shifts: [],
          isDayOff: true,
        },
      ],
    },
    {
      employeeId: 'emp-002',
      employeeName: '员工 B',
      employeeType: '兼职',
      days: [
        {
          date: '2025-08-29',
          shifts: [
            // TODO: 员工B自己的班次列表里也应该有这条替班记录, 这样才能在自己的格子里看到
            {
              id: 'shift-03-sub',
              employeeId: 'emp-002',
              employeeName: '员工 B',
              skillName: '出锅 (替班)',
              startTime: '13:00',
              endTime: '14:00',
              type: 'morning',
            },
          ],
        },
        {
          date: '2025-08-30',
          shifts: [],
        },
        {
          date: '2025-08-31',
          shifts: [],
        },
      ],
    },
    {
      employeeId: 'emp-003',
      employeeName: '员工 C',
      employeeType: '正职',
      days: [
        { date: '2025-08-29', shifts: [] },
        { date: '2025-08-30', shifts: [] },
        { date: '2025-08-31', shifts: [] },
      ],
    },
  ];
};
