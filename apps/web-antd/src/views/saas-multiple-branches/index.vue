<script setup lang="ts">
import type { TableColumnType } from 'ant-design-vue';

import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';

import { generateSchedule, getSchedulePlan } from '#/api/hrp/schedules'; // 引入API

import ScheduleModal from './ScheduleModal.vue';

dayjs.extend(weekOfYear);

// ========== 数据模型定义 (与后端DTO对应) =========
interface Schedule {
  id: number;
  shiftName: string;
  shiftCode: string;
  shiftStartTime: string;
  shiftEndTime: string;
  shiftColorCode: string;
  skillName: string;
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

interface Store {
  id: number;
  name: string;
}

// ========== 状态管理 =========
const router = useRouter();
const loading = ref(true);
const activeStoreId = ref(1); // 默认分店ID，应从用户数据获取或选择
const isScheduleModalVisible = ref(false);
const currentWeekStart = ref(dayjs().startOf('week'));

// ========== 后端数据 =========
const stores = reactive<Store[]>([{ id: 1, name: 'XXX总店' }]); // 实际应通过API获取
const employeeList = ref<Employee[]>([]);
const scheduleRows = ref<ScheduleRow[]>([]);

// ========== 计算属性 (用于生成表格) =========
const weekDays = computed(() => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = currentWeekStart.value.add(i, 'day');
    days.push({
      key: day.format('YYYY-MM-DD'),
      label: day.format('ddd'),
      date: day.format('M/D'),
      isToday: day.isSame(dayjs(), 'day'),
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
    title: () => `${day.date} (${day.label})`,
    dataIndex: day.key,
    key: day.key,
    width: 180,
    align: 'center',
  })),
]);

// ========== 方法 =========
const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      storeId: activeStoreId.value,
      startDate: currentWeekStart.value.format('YYYY-MM-DD'),
      endDate: currentWeekStart.value.endOf('week').format('YYYY-MM-DD'),
    };
    const { data } = await getSchedulePlan(params);

    // 格式化员工数据
    employeeList.value = data.employees.map((e) => ({
      userId: e.userId,
      userName: e.userName,
      employeeType: e.employeeType,
    }));

    // 格式化排班数据以适应表格
    scheduleRows.value = employeeList.value.map((emp) => {
      const dailySchedules = data.scheduleRows[emp.userId] || {};
      return {
        key: emp.userId,
        employee: emp,
        dailySchedules,
      };
    });
  } catch (error) {
    console.error('获取排班计划失败:', error);
    message.error('获取排班计划失败');
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

const goToHistory = () => {
  router.push({ path: '/hrp/schedule-history' }); // 假设历史页面路由
};

const handleScheduleSubmit = async (formData) => {
  console.log('收到排班表单:', formData);
  isScheduleModalVisible.value = false;
  // 此处调用智能排班接口
  try {
    // 构造请求体
    const bo = {
      storeId: activeStoreId.value,
      startDate: currentWeekStart.value.format('YYYY-MM-DD'),
      endDate: currentWeekStart.value.endOf('week').format('YYYY-MM-DD'),
      // ... 其他从 formData 转换的参数
    };
    await generateSchedule(bo);
    message.success('智能排班任务已启动，请稍后刷新查看结果');
    // 理想情况下，这里可以用WebSocket或轮询来获取排班结果
    setTimeout(fetchData, 3000); // 简单延迟后刷新
  } catch (error) {
    console.error('智能排班失败:', error);
    message.error('智能排班失败');
  }
};

const getShiftCellStyle = (schedule: Schedule) => {
  return {
    backgroundColor: schedule.shiftColorCode || '#1890ff',
  };
};

// ========== 生命周期钩子 =========
onMounted(() => {
  fetchData();
});

watch([activeStoreId, currentWeekStart], fetchData);
</script>

<template>
  <div class="schedule-container">
    <!-- 面包屑和标题 -->
    <a-breadcrumb class="breadcrumb-section">
      <a-breadcrumb-item>HRP</a-breadcrumb-item>
      <a-breadcrumb-item>排班管理</a-breadcrumb-item>
      <a-breadcrumb-item>排班计划</a-breadcrumb-item>
    </a-breadcrumb>

    <!-- 筛选区域 -->
    <a-card class="filter-card">
      <a-form layout="inline">
        <a-form-item label="选择分店">
          <a-select v-model:value="activeStoreId" style="width: 200px">
            <a-select-option
              v-for="store in stores"
              :key="store.id"
              :value="store.id"
            >
              {{ store.name }}
            </a-select-option>
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

    <!-- 排班表格 -->
    <a-card class="schedule-card">
      <template #title>
        <div class="card-title-wrapper">
          <span>排班详情</span>
          <a-space>
            <a-button @click="goToHistory">查看历史</a-button>
            <a-button @click="isScheduleModalVisible = true">智能排班</a-button>
            <a-button type="primary">发布排班</a-button>
          </a-space>
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
                class="shift-cell light-text"
                :style="getShiftCellStyle(schedule)"
              >
                <div class="font-bold">
                  {{ schedule.shiftName }} ({{ schedule.skillName }})
                </div>
                <div class="time-range text-xs">
                  {{ schedule.shiftStartTime.substring(0, 5) }} -
                  {{ schedule.shiftEndTime.substring(0, 5) }}
                </div>
              </div>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 智能排班弹窗 -->
    <ScheduleModal
      v-model:visible="isScheduleModalVisible"
      :employees="employeeList"
      :week-days="weekDays"
      @submit="handleScheduleSubmit"
    />
  </div>
</template>

<style lang="less" scoped>
/* 样式与原文件保持一致 */
.schedule-container {
  padding: 16px;
  background-color: #f0f2f5;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .breadcrumb-section {
    margin-bottom: 16px;
  }

  .filter-card {
    margin-bottom: 16px;

    :deep(.ant-card-body) {
      padding: 16px;
    }
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

    .card-title-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}

.shift-cell {
  text-align: left;
  padding: 4px 8px;
  margin-bottom: 4px;
  line-height: 1.5;
  border-radius: 4px;
  height: 100%;
  transition: background 0.3s;
  cursor: pointer;

  &:hover {
    opacity: 0.85;
  }

  &:last-child {
    margin-bottom: 0;
  }

  &.light-text {
    color: #fff;

    .time-range {
      color: #f0f0f0;
    }
  }
}
</style>
