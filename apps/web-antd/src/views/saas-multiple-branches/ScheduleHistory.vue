<script setup lang="ts">
import type { TableColumnType } from 'ant-design-vue';

import { computed, onMounted, reactive, ref } from 'vue';

import {
  CalendarOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons-vue';
import { Modal } from 'ant-design-vue';
import dayjs, { Dayjs } from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(weekOfYear);

// ========== 数据模型 ==========
interface Employee {
  id: number;
  name: string;
  type: '兼职' | '正职';
  skills: string[];
}
interface ShiftHistory {
  position: string;
  timeRange: string;
  actualTimeRange: string;
  status: '代班' | '假期' | '增补' | '早退' | '旷工' | '正常' | '请假' | '迟到';
  tag?: string; // 增补人员的标签
}
interface ScheduleRow {
  key: number;
  employee: Employee;
  [day: string]: any;
}

// ========== 状态管理 ==========
const currentWeekStart = ref(dayjs().startOf('week'));
const isAddPersonModalVisible = ref(false);
const addPersonForm = reactive({
  dayKey: null,
  personType: 'internal', // internal | external
  employeeId: null,
  employeeName: '',
  timeRange: null,
  position: '',
  tag: '',
});

// ========== Mock 数据 ==========
const employees = reactive<Employee[]>([
  { id: 1, name: '张小花', type: '正职', skills: ['柜台', '外场'] },
  { id: 2, name: '李小明', type: '正职', skills: ['内场', '洗碗'] },
  { id: 3, name: '王小红', type: '兼职', skills: ['外场', '清洁'] },
]);
const scheduleData = reactive<ScheduleRow[]>([]);

// ========== 计算属性 ==========
const weekDateRange = computed<[Dayjs, Dayjs]>(() => [
  currentWeekStart.value,
  currentWeekStart.value.endOf('week'),
]);

const weekDays = computed(() => {
  return Array.from({ length: 7 }).map((_, i) => {
    const date = currentWeekStart.value.add(i, 'day');
    return {
      label: `${date.format('dddd')} (${date.format('M.DD')})`,
      key: date.format('YYYY-MM-DD'),
      date,
    };
  });
});

const scheduleTableColumns = computed<TableColumnType[]>(() => [
  {
    title: '员工',
    key: 'employeeName',
    dataIndex: ['employee', 'name'],
    fixed: 'left',
    width: 120,
  },
  ...weekDays.value.map((day) => ({
    title: day.label,
    key: day.key,
    dataIndex: day.key,
    align: 'center',
    width: 200,
  })),
]);

// ========== 方法 ==========
const generateMockSchedule = () => {
  scheduleData.length = 0;
  const statuses: ShiftHistory['status'][] = [
    '正常',
    '迟到',
    '早退',
    '旷工',
    '请假',
    '代班',
  ];
  employees.forEach((emp) => {
    const row: ScheduleRow = { key: emp.id, employee: emp };
    weekDays.value.forEach((day) => {
      if (Math.random() > 0.15) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        row[day.key] = {
          position: '柜台',
          timeRange: '10:50-18:00',
          actualTimeRange: status === '迟到' ? '10:53-18:01' : '10:48-17:50',
          status,
        };
      } else {
        row[day.key] = null; // 休息
      }
    });
    scheduleData.push(row);
  });
};

const changeWeek = (direction: -1 | 1) => {
  currentWeekStart.value = currentWeekStart.value.add(direction, 'week');
  generateMockSchedule();
};

const onDateChange = (dates) => {
  if (dates && dates[0]) {
    currentWeekStart.value = dates[0].startOf('week');
    generateMockSchedule();
  }
};

const getCellStyle = (shift: ShiftHistory) => {
  if (!shift) return {};
  const styleMap = {
    迟到: { backgroundColor: '#fff1f0' },
    早退: { backgroundColor: '#fff1f0' },
    旷工: { backgroundColor: '#fff1f0' },
    请假: { backgroundColor: '#fffbe6' },
    代班: { backgroundColor: '#e6f7ff' },
    增补: { backgroundColor: '#f6ffed' },
    假期: { backgroundColor: '#fafafa' },
    正常: { backgroundColor: '#f0f2f5' },
  };
  return styleMap[shift.status] || {};
};

const getStatusTextColor = (shift: ShiftHistory) => {
  if (!shift) return 'inherit';
  const colorMap = {
    迟到: '#f5222d',
    早退: '#f5222d',
    旷工: '#f5222d',
    请假: '#d48806',
    代班: '#1890ff',
    增补: '#52c41a',
  };
  return colorMap[shift.status] || 'inherit';
};

const getCornerFlagStyle = (shift: ShiftHistory) => {
  if (!shift || shift.status === '正常' || shift.status === '假期')
    return { display: 'none' };
  const color = getStatusTextColor(shift);
  return {
    borderTopColor: color,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: color,
  };
};

const getAttendanceColor = (shift: ShiftHistory) => {
  return shift.status === '迟到' || shift.status === '早退' ? 'red' : 'inherit';
};

const handleDayHoliday = ({ key: holidayType }, dayKey: string) => {
  scheduleData.forEach((row) => {
    const statusText = holidayType === 'all-day' ? '整天放假' : '半天放假';
    row[dayKey] = {
      position: statusText,
      timeRange: '',
      actualTimeRange: '',
      status: '假期',
      tag: statusText,
    };
  });
};

const handleAddPerson = () => {
  const {
    dayKey,
    personType,
    employeeId,
    employeeName,
    timeRange,
    position,
    tag,
  } = addPersonForm;
  if (
    !dayKey ||
    (personType === 'internal' && !employeeId) ||
    (personType === 'external' && !employeeName) ||
    !timeRange ||
    !position
  ) {
    Modal.error({ title: '请填写完整信息' });
    return;
  }

  let targetRow: ScheduleRow | undefined;

  if (personType === 'internal') {
    targetRow = scheduleData.find((r) => r.employee.id === employeeId);
  } else {
    // 外部人员，检查是否已存在
    targetRow = scheduleData.find((r) => r.employee.name === employeeName);
    if (!targetRow) {
      const newEmployee = {
        id: Date.now(),
        name: employeeName,
        type: '兼职',
        skills: ['临时'],
      };
      employees.push(newEmployee);
      const newRow = { key: newEmployee.id, employee: newEmployee };
      weekDays.value.forEach((day) => (newRow[day.key] = null));
      scheduleData.push(newRow);
      targetRow = newRow;
    }
  }

  if (targetRow) {
    targetRow[dayKey] = {
      position,
      timeRange: `${dayjs(timeRange[0]).format('HH:mm')}-${dayjs(timeRange[1]).format('HH:mm')}`,
      actualTimeRange: '未打卡',
      status: '增补',
      tag: tag || '增补',
    };
  }

  isAddPersonModalVisible.value = false;
  // 重置表单
  Object.assign(addPersonForm, {
    dayKey: null,
    personType: 'internal',
    employeeId: null,
    employeeName: '',
    timeRange: null,
    position: '',
    tag: '',
  });
};

onMounted(() => {
  generateMockSchedule();
});
</script>

<template>
  <div class="schedule-history-container p-4">
    <!-- 顶部筛选栏 -->
    <a-card :bordered="false" class="filter-card">
      <a-form layout="inline">
        <a-form-item label="员工类型">
          <a-select placeholder="请选择" style="width: 120px" allow-clear>
            <a-select-option value="FullTime">正职</a-select-option>
            <a-select-option value="PartTime">兼职</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="员工姓名">
          <a-input placeholder="请输入" style="width: 150px" allow-clear />
        </a-form-item>
        <a-form-item label="员工工号">
          <a-input placeholder="请输入" style="width: 150px" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-button type="primary">查询</a-button>
          <a-button style="margin-left: 8px">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 主排班记录卡片 -->
    <a-card :bordered="false" class="schedule-card">
      <template #title>
        <div class="card-title-wrapper">
          <span>历史记录</span>
          <a-space align="center">
            <!-- 周切换器 -->
            <a-button-group>
              <a-button @click="changeWeek(-1)">
                <LeftOutlined />
              </a-button>
              <a-range-picker
                :value="weekDateRange"
                :bordered="false"
                style="width: 240px"
                @change="onDateChange"
              />
              <a-button @click="changeWeek(1)">
                <RightOutlined />
              </a-button>
            </a-button-group>

            <a-button @click="isAddPersonModalVisible = true">增补</a-button>
            <a-button type="primary">导出</a-button>
          </a-space>
        </div>
      </template>

      <!-- 历史排班表格 -->
      <a-table
        :columns="scheduleTableColumns"
        :data-source="scheduleData"
        :pagination="false"
        bordered
        size="middle"
        :scroll="{ x: 1200 }"
      >
        <!-- 自定义表头，用于添加假期设置icon -->
        <template #headerCell="{ column }">
          <div
            v-if="weekDays.map((d) => d.key).includes(column.key as string)"
            class="date-header"
          >
            <span>{{ column.title }}</span>
            <a-dropdown :trigger="['click']">
              <CalendarOutlined class="holiday-icon" />
              <template #overlay>
                <a-menu @click="(e) => handleDayHoliday(e, column.key)">
                  <a-menu-item key="all-day">整天放假</a-menu-item>
                  <a-menu-item key="half-day">半天放假</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </template>

        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'employeeName'">
            <a-space align="center">
              <span>{{ record.employee.name }}</span>
              <a-tag v-if="record.employee.type === '正职'" color="blue">
                正
              </a-tag>
              <a-tag v-if="record.employee.type === '兼职'" color="orange">
                兼
              </a-tag>
            </a-space>
          </template>
          <template
            v-else-if="
              weekDays.map((d) => d.key).includes(column.key as string)
            "
          >
            <!-- 使用 Popover 展示详细信息 -->
            <a-popover trigger="click" placement="right">
              <template #content>
                <div class="popover-content">
                  <a-avatar size="large">
                    {{ record.employee.name.charAt(0) }}
                  </a-avatar>
                  <div class="employee-info">
                    <h3>{{ record.employee.name }}</h3>
                    <p>{{ column.title }}</p>
                  </div>
                  <a-descriptions :column="1" size="small" class="mt-4">
                    <a-descriptions-item label="上班时间">
                      {{ record[column.key]?.timeRange }}
                    </a-descriptions-item>
                    <a-descriptions-item label="本日考勤">
                      <span :class="getAttendanceColor(record[column.key])">
                        {{ record[column.key]?.actualTimeRange }}
                      </span>
                    </a-descriptions-item>
                    <a-descriptions-item label="员工ID">
                      {{ record.employee.id }}
                    </a-descriptions-item>
                    <a-descriptions-item label="类型">
                      {{ record.employee.type }}
                    </a-descriptions-item>
                    <a-descriptions-item label="技能">
                      <a-tag
                        v-for="skill in record.employee.skills"
                        :key="skill"
                      >
                        {{ skill }}
                      </a-tag>
                    </a-descriptions-item>
                  </a-descriptions>
                </div>
              </template>
              <div
                v-if="record[column.key]"
                class="shift-cell-history"
                :style="getCellStyle(record[column.key])"
              >
                <div
                  class="corner-flag"
                  :style="getCornerFlagStyle(record[column.key])"
                ></div>
                <span
                  class="status-text"
                  :style="{ color: getStatusTextColor(record[column.key]) }"
                >
                  【{{ record[column.key].tag || record[column.key].status }}】
                </span>
                <span>
                  {{ record[column.key].position }}
                  {{ record[column.key].timeRange }}
                </span>
              </div>
              <div v-else class="rest-cell">休息</div>
            </a-popover>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 增补人员 Modal -->
    <a-modal
      v-model:visible="isAddPersonModalVisible"
      title="增补排班"
      @ok="handleAddPerson"
    >
      <a-form :model="addPersonForm" layout="vertical">
        <a-form-item label="选择日期">
          <a-select
            v-model:value="addPersonForm.dayKey"
            :options="weekDays.map((d) => ({ value: d.key, label: d.label }))"
          />
        </a-form-item>
        <a-form-item label="人员类型">
          <a-radio-group v-model:value="addPersonForm.personType">
            <a-radio value="internal">内部员工</a-radio>
            <a-radio value="external">外部人员</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="员工姓名">
          <a-select
            v-if="addPersonForm.personType === 'internal'"
            v-model:value="addPersonForm.employeeId"
            placeholder="请选择内部员工"
            :options="employees.map((e) => ({ value: e.id, label: e.name }))"
          />
          <a-input
            v-else
            v-model:value="addPersonForm.employeeName"
            placeholder="请输入外部人员姓名"
          />
        </a-form-item>
        <a-form-item label="标签 (例如: 体验工)">
          <a-input v-model:value="addPersonForm.tag" placeholder="请输入标签" />
        </a-form-item>
        <a-form-item label="班次时间">
          <a-time-range-picker
            v-model:value="addPersonForm.timeRange"
            format="HH:mm"
          />
        </a-form-item>
        <a-form-item label="岗位">
          <a-input v-model:value="addPersonForm.position" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style lang="less" scoped>
.schedule-history-container {
  background-color: #f0f2f5;
}
.filter-card,
.schedule-card {
  margin-bottom: 16px;
}
.card-title-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.date-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  .holiday-icon {
    cursor: pointer;
    color: #888;
    &:hover {
      color: #1890ff;
    }
  }
}
.shift-cell-history {
  position: relative;
  padding: 8px;
  padding-left: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  overflow: hidden;
  text-align: left;

  .corner-flag {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 12px;
  }

  .status-text {
    font-weight: 500;
  }
}
.rest-cell {
  color: #aaa;
}
.popover-content {
  width: 280px;
  .employee-info {
    display: inline-block;
    vertical-align: top;
    margin-left: 16px;
    h3 {
      margin-bottom: 0;
    }
    p {
      color: #888;
    }
  }
}
.mt-4 {
  margin-top: 16px;
}
</style>
