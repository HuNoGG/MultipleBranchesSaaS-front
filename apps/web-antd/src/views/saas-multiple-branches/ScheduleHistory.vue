<script setup lang="ts">
import type { TableColumnType } from 'ant-design-vue';

import { computed, h, onMounted, ref, watch } from 'vue';

import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';

import { getScheduleHistory } from '#/api/hrp/schedules'; // 引入API

dayjs.extend(weekOfYear);

// ========== 数据模型定义 =========
interface Schedule {
  id: number;
  shiftName: string;
  shiftStartTime: string;
  shiftEndTime: string;
  skillName: string;
  attendanceStatus: '忘记打卡' | '早退' | '正常' | '缺勤' | '迟到' | string;
}

interface Employee {
  userId: number;
  userName: string;
  employeeType: string;
}

interface ScheduleRow {
  key: number;
  employee: Employee;
  dailySchedules: Record<string, Schedule[]>;
}

// ========== 状态管理 =========
const loading = ref(true);
const activeStoreId = ref(1);
const currentWeekStart = ref(dayjs().subtract(1, 'week').startOf('week')); // 默认显示上周
const employeeList = ref<Employee[]>([]);
const scheduleRows = ref<ScheduleRow[]>([]);

// ========== 计算属性 =========
const weekDays = computed(() => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = currentWeekStart.value.add(i, 'day');
    days.push({
      key: day.format('YYYY-MM-DD'),
      label: day.format('ddd'),
      date: day.format('M/D'),
    });
  }
  return days;
});

const columns = computed<TableColumnType[]>(() => [
  {
    title: '员工',
    dataIndex: 'employee',
    key: 'employee',
    width: 150,
    fixed: 'left',
  },
  ...weekDays.value.map((day) => ({
    title: `${day.date} (${day.label})`,
    dataIndex: day.key,
    key: day.key,
    width: 180,
    align: 'center',
  })),
]);

const statusMap = {
  正常: { color: '#87d068', text: '正常' },
  迟到: { color: '#f50', text: '迟到' },
  早退: { color: '#ffa940', text: '早退' },
  缺勤: { color: '#d9d9d9', text: '缺勤' },
  忘记打卡: { color: '#2db7f5', text: '忘打卡' },
};

// ========== 方法 =========
const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      storeId: activeStoreId.value,
      startDate: currentWeekStart.value.format('YYYY-MM-DD'),
      endDate: currentWeekStart.value.endOf('week').format('YYYY-MM-DD'),
    };
    const data = await getScheduleHistory(params);

    employeeList.value = data.employees.map((e) => ({
      userId: e.userId,
      userName: e.userName,
      employeeType: e.employeeType,
    }));

    scheduleRows.value = employeeList.value.map((emp) => {
      const dailySchedules = data.scheduleRows[emp.userId] || {};
      return {
        key: emp.userId,
        employee: emp,
        dailySchedules,
      };
    });
  } catch (error) {
    console.error('获取排班历史失败:', error);
    message.error('获取排班历史失败');
  } finally {
    loading.value = false;
  }
};

const prevWeek = () => {
  currentWeekStart.value = currentWeekStart.value.subtract(1, 'week');
};

const nextWeek = () => {
  currentWeekStart.value = currentWeekStart.value.add(1, 'week');
};

const getStatusInfo = (status: string) => {
  return statusMap[status] || { color: '#108ee9', text: status };
};

// ========== 生命周期钩子 =========
onMounted(fetchData);
watch([activeStoreId, currentWeekStart], fetchData);
</script>

<template>
  <div class="schedule-history-container">
    <a-breadcrumb class="breadcrumb-section">
      <a-breadcrumb-item>HRP</a-breadcrumb-item>
      <a-breadcrumb-item>排班管理</a-breadcrumb-item>
      <a-breadcrumb-item>排班历史</a-breadcrumb-item>
    </a-breadcrumb>

    <a-card class="filter-card">
      <a-form layout="inline">
        <a-form-item label="选择分店">
          <a-select v-model:value="activeStoreId" style="width: 200px" disabled>
            <a-select-option :value="1">XXX总店</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button-group>
            <a-button :icon="h(LeftOutlined)" @click="prevWeek" />
            <a-button :icon="h(RightOutlined)" @click="nextWeek" />
          </a-button-group>
        </a-form-item>
        <a-form-item>
          <span class="text-lg font-semibold">
            {{ currentWeekStart.format('YYYY年MM月DD日') }} -
            {{ currentWeekStart.endOf('week').format('YYYY年MM月DD日') }}
          </span>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card class="schedule-card">
      <template #title>
        <div class="card-title-wrapper">
          <span>历史排班与考勤</span>
        </div>
      </template>
      <a-table
        :columns="columns"
        :data-source="scheduleRows"
        :loading="loading"
        :pagination="false"
        :scroll="{ x: 1500, y: 'calc(100vh - 350px)' }"
        bordered
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'employee'">
            <div>
              <span class="font-semibold">{{ record.employee.userName }}</span>
              <a-tag
                :color="
                  record.employee.employeeType === '全职' ? 'blue' : 'green'
                "
                class="ml-2"
              >
                {{ record.employee.employeeType }}
              </a-tag>
            </div>
          </template>
          <template v-else>
            <div v-if="record.dailySchedules[column.key]">
              <div
                v-for="schedule in record.dailySchedules[column.key]"
                :key="schedule.id"
                class="shift-cell-history"
              >
                <div class="shift-info">
                  <span class="font-bold"
                    >{{ schedule.shiftName }} ({{ schedule.skillName }})</span
                  >
                  <span class="time-range text-xs">
                    {{ schedule.shiftStartTime.substring(0, 5) }} -
                    {{ schedule.shiftEndTime.substring(0, 5) }}
                  </span>
                </div>
                <a-tag
                  :color="getStatusInfo(schedule.attendanceStatus).color"
                  class="status-tag"
                >
                  {{ getStatusInfo(schedule.attendanceStatus).text }}
                </a-tag>
              </div>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<style lang="less" scoped>
.schedule-history-container {
  padding: 16px;
  background-color: #f0f2f5;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.breadcrumb-section,
.filter-card {
  margin-bottom: 16px;
}

.schedule-card {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  :deep(.ant-card-body) {
    padding: 0;
    flex-grow: 1;
    overflow: auto;
  }
}

.card-title-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shift-cell-history {
  position: relative;
  padding: 8px;
  border-radius: 4px;
  background-color: #fafafa;
  border: 1px solid #e8e8e8;
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }

  .shift-info {
    display: flex;
    flex-direction: column;
  }

  .status-tag {
    position: absolute;
    top: 4px;
    right: 4px;
  }
}
</style>
