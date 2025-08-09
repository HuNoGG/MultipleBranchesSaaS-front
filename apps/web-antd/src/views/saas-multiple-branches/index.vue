<template>
  <div class="p-4 scheduling-container">
    <a-card title="基础自动排班系统" :bordered="false" style="width: 100%">
      <!-- 操作区域 -->
      <a-space direction="vertical" style="width: 100%" size="large">
        <a-row justify="space-between">
          <a-col>
            <a-space wrap>
              <a-button type="primary" @click="generateSchedule" :loading="loading">
                <template #icon>
                  <Icon icon="ant-design:play-circle-outlined" />
                </template>
                一键生成周度排班
              </a-button>
              <a-button @click="resetSchedule">
                <template #icon>
                  <Icon icon="ant-design:reload-outlined" />
                </template>
                重置排班表
              </a-button>
            </a-space>
          </a-col>
          <a-col>
            <a-button type="primary" danger @click="submitScheduleData">
              <template #icon>
                <Icon icon="ant-design:upload-outlined" />
              </template>
              提交排班数据 (查看Console)
            </a-button>
          </a-col>
        </a-row>

        <!-- 每日需求人数配置 -->
        <a-divider orientation="left">每日各岗位需求人数配置</a-divider>
        <div class="requirements-grid">
          <a-card
            v-for="(req, index) in dailyRequirements"
            :key="index"
            :title="`时段 ${req.timeSlot}`"
            size="small"
          >
            <a-space direction="vertical" style="width: 100%">
              <a-row
                v-for="skill in allSkills"
                :key="skill"
                justify="space-between"
                align="middle"
              >
                <a-col>{{ skill }}</a-col>
                <a-col>
                  <a-input-number
                    v-model:value="req.positions[skill]"
                    :min="0"
                    :max="5"
                    size="small"
                    style="width: 60px"
                  />
                </a-col>
              </a-row>
            </a-space>
          </a-card>
        </div>
      </a-space>

      <a-divider>周度排班表</a-divider>

      <!-- 排班表格 -->
      <a-table
        :columns="tableColumns"
        :data-source="scheduleData"
        :pagination="false"
        bordered
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <!-- 自定义渲染员工信息列 -->
          <template v-if="column.key === 'employeeInfo'">
            <div>
              <strong>{{ record.employee.name }}</strong>
            </div>
            <a-tag :color="record.employee.type === 'FullTime' ? 'blue' : 'green'">
              {{ record.employee.type === 'FullTime' ? '正职' : '兼职' }}
            </a-tag>
          </template>

          <!-- 自定义渲染日期排班列 -->
          <template v-else>
            <a-tooltip :title="getShiftDetails(record[column.key as string])">
              <a-tag :color="getShiftTagColor(record[column.key as string])">
                {{ record[column.key as string] || '休息' }}
              </a-tag>
            </a-tooltip>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';
import type { TableColumnType } from 'ant-design-vue';
import Icon from '@ant-design/icons-vue';

// ========== 数据模型定义 (TypeScript Interfaces) ==========

/**
 * 员工信息接口
 */
interface Employee {
  id: number; // 员工唯一ID
  name: string; // 员工姓名
  type: 'FullTime' | 'PartTime'; // 员工类型：'FullTime'为正职, 'PartTime'为兼职
  skills: string[]; // 员工掌握的技能列表
}

/**
 * 每日时段需求接口
 */
interface ShiftRequirement {
  timeSlot: string; // 时间段, 例如 '10:30-18:00'
  positions: Record<string, number>; // 岗位需求, key为技能名, value为需要的人数
}

/**
 * 排班表行数据接口
 */
interface ScheduleRow {
  key: number; // 对应员工ID
  employee: Employee; // 员工对象
  [day: string]: any; // 动态的星期字段，值为班次字符串
}

// ========== Mock 数据区域 ==========
// TODO: 未来这些数据应通过API从后端获取

/**
 * 员工列表 - 8名员工，包含正职和兼职
 */
const mockEmployees: Employee[] = [
  { id: 1, name: '张三', type: 'FullTime', skills: ['柜台', '外场', '内场'] },
  { id: 2, name: '李四', type: 'FullTime', skills: ['内场', '洗碗', '清洁'] },
  { id: 3, name: '王五', type: 'FullTime', skills: ['柜台', '外场'] },
  { id: 4, name: '赵六', type: 'FullTime', skills: ['内场', '清洁', '外场'] },
  { id: 5, name: '孙七', type: 'FullTime', skills: ['柜台', '洗碗'] },
  { id: 6, name: '周八', type: 'PartTime', skills: ['外场', '清洁'] },
  { id: 7, name: '吴九', type: 'PartTime', skills: ['内场', '洗碗'] },
  { id: 8, name: '郑十', type: 'PartTime', skills: ['柜台'] },
];

/**
 * 所有可能的技能/岗位列表
 */
const allSkills: string[] = ['柜台', '外场', '内场', '洗碗', '清洁'];

/**
 * 可自定义的每日各时段人力需求
 */
const dailyRequirements = reactive<ShiftRequirement[]>([
  { timeSlot: '10:30-18:00', positions: { 柜台: 1, 外场: 1, 内场: 1, 洗碗: 0, 清洁: 0 } },
  { timeSlot: '18:00-23:00', positions: { 柜台: 1, 外场: 1, 内场: 1, 洗碗: 1, 清洁: 1 } },
  { timeSlot: '20:00-23:00', positions: { 柜台: 0, 外场: 1, 内场: 0, 洗碗: 0, 清洁: 0 } },
]);

// ========== Vue 响应式状态 ==========

const loading = ref(false); // 控制“生成排班”按钮的加载状态
const weekDays = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
const scheduleData = reactive<ScheduleRow[]>([]); // 存储最终排班结果，用于表格渲染

// 定义表格列
const tableColumns: TableColumnType[] = [
  { title: '员工信息', dataIndex: 'employee', key: 'employeeInfo', fixed: 'left', width: 150 },
  ...weekDays.map((day) => ({
    title: day,
    dataIndex: day,
    key: day,
    align: 'center',
    width: 120,
  })),
];

// ==========核心业务逻辑函数==========

/**
 * 初始化或重置排班表结构
 * 为每个员工创建一行空的排班数据
 */
const initializeSchedule = () => {
  scheduleData.length = 0; // 清空现有数据
  mockEmployees.forEach((emp) => {
    const row: ScheduleRow = {
      key: emp.id,
      employee: emp,
    };
    weekDays.forEach((day) => {
      row[day] = ''; // 默认设置为空，表示休息
    });
    scheduleData.push(row);
  });
};

/**
 * 生成排班的核心函数
 * 这是一个基础的演示算法，实际生产环境需要更复杂的规则
 */
const generateSchedule = () => {
  loading.value = true;
  initializeSchedule(); // 先重置

  // 模拟异步计算，提升用户体验
  setTimeout(() => {
    // 记录每个员工本周已安排的工作天数
    const workDaysCount = new Map<number, number>(mockEmployees.map((e) => [e.id, 0]));

    // 1. 优先安排正职员工，并保证每周休2天
    const fullTimers = scheduleData.filter((row) => row.employee.type === 'FullTime');
    weekDays.forEach((day) => {
      fullTimers.forEach((row) => {
        const currentWorkDays = workDaysCount.get(row.key) || 0;
        // 如果该员工本周工作还没满5天，则安排上班
        if (currentWorkDays < 5) {
          row[day] = '正职班';
          workDaysCount.set(row.key, currentWorkDays + 1);
        }
      });
    });

    // 2. 安排兼职员工 (这是一个简化的随机分配逻辑)
    // 实际应用中需要根据dailyRequirements和员工技能进行匹配
    const partTimers = scheduleData.filter((row) => row.employee.type === 'PartTime');
    const partTimeShifts = ['兼职早', '兼职晚', '兼职打烊'];
    weekDays.forEach((day) => {
      partTimers.forEach((row) => {
        // 随机决定当天是否上班以及上哪个班次
        if (Math.random() > 0.4) {
          // 60%的概率安排上班
          const shiftType = partTimeShifts[Math.floor(Math.random() * partTimeShifts.length)];
          row[day] = shiftType;
        }
      });
    });

    loading.value = false;
    message.success('已生成新的排班计划！');
  }, 500);
};

/**
 * 重置整个排班表
 */
const resetSchedule = () => {
  Modal.confirm({
    title: '确认操作',
    content: '确定要清空当前的排班表吗？所有未提交的更改将丢失。',
    okText: '确认重置',
    cancelText: '取消',
    onOk: () => {
      initializeSchedule();
      message.info('排班表已重置。');
    },
  });
};

/**
 * 提交排班数据
 * 在控制台打印出JSON格式的数据
 */
const submitScheduleData = () => {
  const dataToSubmit = {
    weeklySchedule: scheduleData,
    staffingRequirements: dailyRequirements,
  };

  console.log('========== 提交的排班数据 (JSON格式) ==========');
  // 使用JSON.stringify格式化输出，方便查看
  console.log(JSON.stringify(dataToSubmit, null, 2));
  console.log('=============================================');

  message.success('排班数据已成功打印到浏览器控制台，请按 F12 查看。');
};

// ========== 辅助显示函数 ==========

/**
 * 根据班次名称获取标签颜色
 */
const getShiftTagColor = (shift: string): string => {
  if (!shift) return 'default'; // 休息
  if (shift.includes('正职')) return 'cyan';
  if (shift.includes('兼职早')) return 'success';
  if (shift.includes('兼职晚')) return 'warning';
  if (shift.includes('兼职打烊')) return 'error';
  return 'default';
};

/**
 * 根据班次名称获取详细信息，用于Tooltip提示
 */
const getShiftDetails = (shift: string): string => {
  switch (shift) {
    case '正职班':
      return '班次: 10:30-23:00 (含两次30分钟休息)';
    case '兼职早':
      return '班次: 10:30-18:00 (无休息)';
    case '兼职晚':
      return '班次: 18:00-23:00 (无休息)';
    case '兼职打烊':
      return '班次: 20:00-23:00 (无休息)';
    default:
      return '当天休息';
  }
};

// ========== Vue生命周期钩子 ==========

/**
 * 组件挂载后，初始化排班表
 */
onMounted(() => {
  initializeSchedule();
});
</script>

<style scoped>
.scheduling-container {
  background-color: #fff;
}
.requirements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
</style>
