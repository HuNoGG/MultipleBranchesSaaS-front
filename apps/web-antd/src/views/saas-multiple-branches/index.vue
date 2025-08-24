<script setup lang="ts">
import type { TableColumnType } from 'ant-design-vue';

// 按照要求修改 import 语句
import { computed, onMounted, reactive, ref, watch } from 'vue';

// 按照要求修改 import 语句
import {
  CalendarOutlined,
  CheckCircleOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import dayjs, { Dayjs } from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';

// 1. 接口导入路径已修改
import { getWeeklySchedule, publishSchedule } from '#/api/hrp/schedules';

import { storeEventsAdd } from '../hrp/storeEvents';
import { storesList } from '../hrp/stores';
import AddSupplementModal from './AddSupplementModal.vue';
import ScheduleModal from './ScheduleModal.vue';
import ShiftAdjustModal from './ShiftAdjustModal.vue';

dayjs.extend(weekOfYear);

// ========== 数据模型定义 ==========
interface Employee {
  id: number;
  name: string;
  type: '兼职' | '正职' | string;
  skills?: string[];
}
interface ShiftAssignment {
  id: number;
  position: string;
  timeRange: string;
  shiftLabel: string;
  shiftType?: string;
  shiftCode?: string;
  shiftColorCode?: string;
  // 历史数据独有
  status?: string;
  actualTimeRange?: string;
  tag?: string; // 增补人员标签
}
interface ScheduleRow {
  key: number;
  employee: Employee;
  [dayKey: string]: any;
}
interface Store {
  id: number;
  name: string;
}

// ========== 状态管理 ==========
const loading = ref(true);
const activeStoreId = ref(1);
const stores = reactive<Store[]>([]);
const currentWeekStart = ref(dayjs().startOf('week'));
const scheduleData = ref<ScheduleRow[]>([]);
const employees = ref<Employee[]>([]);

// ========== 弹窗逻辑 ==========
const isScheduleModalVisible = ref(false);
const shiftAdjustModalState = reactive({ visible: false, data: null });
const isAddPersonModalVisible = ref(false);
const isCurrentWeekPublished = ref(false);

// ========== 计算属性 ==========
const isPastWeek = computed(() =>
  currentWeekStart.value.isBefore(dayjs().startOf('week')),
);
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
    dataIndex: 'employee',
    key: 'employee',
    fixed: 'left',
    width: 120,
  },
  ...weekDays.value.map((day) => ({
    title: day.label,
    dataIndex: day.key,
    key: day.key,
    align: 'center',
    width: 180,
  })),
]);

// ========== API 调用与数据处理 ==========
const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      storeId: activeStoreId.value,
      startDate: currentWeekStart.value.format('YYYY-MM-DD'),
      endDate: currentWeekStart.value.endOf('week').format('YYYY-MM-DD'),
    };

    // 调用统一的周数据接口
    const data = await getWeeklySchedule(params);
    isCurrentWeekPublished.value = data.status === 'PUBLISHED';

    // 首次加载店铺列表
    if (stores.length === 0) {
      const storeList = await storesList();
      // 使用 .push(...array) 来保持响应性
      stores.push(...storeList.rows);
    }

    formatApiData(data);
  } catch (error) {
    console.error('获取排班数据失败:', error);
    message.error('获取排班数据失败');
    scheduleData.value = [];
  } finally {
    loading.value = false;
  }
};

const formatApiData = (apiData) => {
  const { employees: apiEmployees, scheduleRows } = apiData;

  employees.value = apiEmployees.map((e) => ({
    id: e.userId,
    name: e.userName,
    type: e.employeeType,
    skills: e.skills ? e.skills.map((s) => s.name) : [],
  }));

  scheduleData.value = employees.value.map((emp) => {
    const row: ScheduleRow = { key: emp.id, employee: emp };
    const dailySchedules = scheduleRows ? scheduleRows[emp.id] || {} : {};
    for (const day of weekDays.value) {
      const scheduleList = dailySchedules[day.key] || [];
      const mainSchedule = scheduleList[0];
      row[day.key] = mainSchedule
        ? {
            id: mainSchedule.id,
            position: mainSchedule.skillName,
            skillId: mainSchedule.skillId,
            userId: mainSchedule.userId,
            timeRange: `${mainSchedule.shiftStartTime.slice(0, 5)}-${mainSchedule.shiftEndTime.slice(0, 5)}`,
            shiftLabel: mainSchedule.shiftName,
            status: mainSchedule.attendanceStatus || '正常',
            shiftType: emp.type === '正职' ? 'FullTime' : 'PartTime',
            shiftCode: mainSchedule.shiftCode,
            shiftColorCode: mainSchedule.shiftColorCode,
            actualTimeRange: '未打卡', // 实际应从考勤记录获取
            tag: mainSchedule.attendanceStatus,
          }
        : null;
    }
    return row;
  });
};

// ========== 页面交互逻辑 ==========
const changeWeek = (direction: -1 | 1) => {
  currentWeekStart.value = currentWeekStart.value.add(direction, 'week');
};

onMounted(fetchData);
watch([activeStoreId, currentWeekStart], fetchData);

const handleCellClick = (record: ScheduleRow, dayKey: string) => {
  const cellData = record[dayKey];
  if (!cellData || isPastWeek.value) return;
  shiftAdjustModalState.data = {
    employee: record.employee,
    shift: cellData,
    date: weekDays.value.find((d) => d.key === dayKey)?.label || dayKey,
    dayKey,
    isPublished: isCurrentWeekPublished.value,
    storeId: activeStoreId.value,
  };
  shiftAdjustModalState.visible = true;
};

const onDateChange = (dates) => {
  if (dates && dates[0]) {
    currentWeekStart.value = dates[0].startOf('week');
  }
};

// 发布排班
const handlePublishSchedule = () => {
  Modal.confirm({
    title: '确认发布当前周的排班计划吗？',
    content: '发布后将锁定排班，并开始关联实时考勤。后续只能进行小范围调整。',
    onOk: async () => {
      try {
        loading.value = true;
        await publishSchedule({
          storeId: activeStoreId.value,
          startDate: currentWeekStart.value.format('YYYY-MM-DD'),
          endDate: currentWeekStart.value.endOf('week').format('YYYY-MM-DD'),
        });
        message.success('排班发布成功！');
        await fetchData();
      } catch {
        message.error('发布失败');
      } finally {
        loading.value = false;
      }
    },
  });
};

// 整天/半天放假
const handleDayHoliday = async ({ key: holidayType }, dayKey: string) => {
  // 此处应调用后台接口来设置或取消当天的特殊事件
  await storeEventsAdd({
    storeId: activeStoreId.value,
    eventDate: dayKey,
    eventType: holidayType,
    description:
      holidayType === 'all-day'
        ? '整天放假'
        : holidayType === 'am-off'
          ? '上午放假'
          : '下午放假',
  });
  message.info(
    `已为 ${dayKey} 设置 ${holidayType}。后台接口待实现，刷新后生效。`,
  );
  fetchData();
};

// ... 其他按钮逻辑 (智能排班, 重置, 增补, 导出)
const handleSmartSchedule = () => (isScheduleModalVisible.value = true);
const handleResetSchedule = () => {
  Modal.confirm({
    title: '确认重置排班表吗？',
    content: '所有已安排的班次都将被清空。',
    onOk: () => {
      scheduleData.value.forEach((row) => {
        weekDays.value.forEach((day) => {
          row[day.key] = null;
        });
      });
      message.success('排班表已清空');
    },
  });
};
// ========== 单元格样式 ==========
const getAttendanceColor = (shift: ShiftAssignment) => {
  return shift?.status === '迟到' || shift.status === '早退'
    ? 'red'
    : 'inherit';
};

const getCellStyle = (shift: ShiftAssignment, employeeType: string) => {
  if (!shift) return {};

  if (isPastWeek.value) {
    const historyStyleMap = {
      迟到: { backgroundColor: '#fff1f0' },
      迟到未请假: { backgroundColor: '#fff1f0' },
      早退: { backgroundColor: '#fff1f0' },
      早退未请假: { backgroundColor: '#fff1f0' },
      缺勤: { backgroundColor: '#fff1f0' },
      忘记打卡: { backgroundColor: '#fff1f0' },
      旷工: { backgroundColor: '#fff1f0' },
      请假: { backgroundColor: '#fffbe6' },
      正常: { backgroundColor: '#f9f9f9' },
      代班: { backgroundColor: '#e6f7ff' },
      增补: { backgroundColor: '#f6ffed' },
    };

    return historyStyleMap[shift.status] || { backgroundColor: '#f0f2f5' };
  }

  // 未来样式
  let shiftType;
  debugger;
  if (employeeType === '正职') {
    shiftType = 'FullTime';
  } else if (employeeType === '兼职') {
    shiftType =
      shift.shiftCode === '早'
        ? 'PartTimeMorning'
        : shift.shiftCode === '晚'
          ? 'PartTimeEvening'
          : 'PartTime';
  } else {
    shiftType = 'supplement';
  }
  const futureStyleMap = {
    FullTime: { background: 'rgba(68, 99, 255, 1)' },
    PartTimeM: {
      background:
        'linear-gradient(to left, rgba(221, 172, 51, 0.2), rgba(221, 172, 51, 0.05))',
    },
    PartTimeMorning: {
      background:
        'linear-gradient(to left, rgba(221, 172, 51, 0.2), rgba(221, 172, 51, 0.05))',
    },
    PartTimeEvening: {
      background:
        'linear-gradient(to right, rgba(221, 172, 51, 0.2), rgba(221, 172, 51, 0.05))',
    },
    PartTime: {
      background:
        'linear-gradient(to right, rgba(221, 172, 51, 0.2), rgba(221, 172, 51, 0.05))',
    },
    supplement: {
      background:
        'linear-gradient(to right, rgba(221, 172, 51, 0.2), rgba(221, 172, 51, 0.05))',
    },
  };
  return futureStyleMap[shiftType] || {};
};

const getCornerFlagStyle = (shift: ShiftAssignment) => {
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

// 3. 迟到早退的此处代码需要加入:
const getStatusTextColor = (shift: ShiftAssignment) => {
  if (!shift) return 'inherit';
  const colorMap = {
    迟到: '#f5222d',
    迟到未请假: '#f5222d',
    早退: '#f5222d',
    早退未请假: '#f5222d',
    旷工: '#f5222d',
    缺勤: '#f5222d',
    忘记打卡: '#f5222d',
    请假: '#d48806',
    代班: '#1890ff',
    增补: '#52c41a',
  };
  return colorMap[shift.status] || 'inherit';
};
</script>

<template>
  <div class="scheduling-page-container">
    <div class="left-panel">
      <div class="search-section">
        <a-input-search placeholder="搜索分店" style="width: 100%" />
      </div>
      <div class="store-list">
        <div
          v-for="store in stores"
          :key="store.id"
          class="store-item"
          :class="[{ active: store.id === activeStoreId }]"
          @click="activeStoreId = store.id"
        >
          <div class="store-name">{{ store.name }}</div>
          <div class="store-id">编号：{{ store.id }}</div>
        </div>
      </div>
    </div>

    <div class="right-panel">
      <a-card :bordered="false" class="filter-card">
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
      </a-card>

      <a-card :bordered="false" class="schedule-card">
        <template #title>
          <div class="card-title-wrapper">
            <a-space align="center">
              <span>周度排班表</span>
              <a-tag
                v-if="!isPastWeek && isCurrentWeekPublished"
                color="#87d068"
              >
                <template #icon><CheckCircleOutlined /></template>
                已发布
              </a-tag>
              <a-tag
                v-if="!isPastWeek && !isCurrentWeekPublished"
                color="#2db7f5"
              >
                <template #icon><CheckCircleOutlined /></template>
                草稿
              </a-tag>
              <a-tag v-if="isPastWeek && isCurrentWeekPublished" color="#f50">
                <template #icon><CheckCircleOutlined /></template>
                历史
              </a-tag>
            </a-space>
            <a-space>
              <template v-if="isPastWeek">
                <a-button type="primary">导出历史</a-button>
              </template>
              <template v-else>
                <template v-if="isCurrentWeekPublished">
                  <a-button @click="isAddPersonModalVisible = true">
                    增补人员
                  </a-button>
                  <a-button type="primary">导出</a-button>
                </template>
                <template v-else>
                  <a-button @click="handleResetSchedule">重置排班表</a-button>
                  <a-button type="primary" @click="handleSmartSchedule">
                    智能排班
                  </a-button>
                  <a-button
                    @click="handlePublishSchedule"
                    style="color: #52c41a; border-color: #52c41a"
                  >
                    发布版本
                  </a-button>
                </template>
              </template>
            </a-space>
          </div>
        </template>

        <a-table
          :columns="scheduleTableColumns"
          :data-source="scheduleData"
          :loading="loading"
          :pagination="false"
          bordered
          size="middle"
          :scroll="{ x: 1200, y: 'calc(100vh - 400px)' }"
        >
          <template #headerCell="{ column }">
            <div
              v-if="weekDays.map((d) => d.key).includes(String(column.key))"
              class="date-header"
            >
              <span>{{ column.title }}</span>
              <a-dropdown :trigger="['click']">
                <CalendarOutlined class="holiday-icon" />
                <template #overlay>
                  <a-menu @click="(e) => handleDayHoliday(e, column.key)">
                    <a-menu-item key="all-day">整天放假</a-menu-item>
                    <a-menu-item key="am-off">上午放假</a-menu-item>
                    <a-menu-item key="pm-off">下午放假</a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="cancel-off">取消放假</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'employee'">
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
            <template v-else>
              <div v-if="record[column.key]">
                <a-popover v-if="isPastWeek" trigger="click" placement="right">
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
                          <span
                            :style="{
                              color: getAttendanceColor(record[column.key]),
                            }"
                          >
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
                    class="shift-cell-history cell-content"
                    :style="
                      getCellStyle(record[column.key], record.employee.type)
                    "
                  >
                    <div
                      class="corner-flag"
                      :style="getCornerFlagStyle(record[column.key])"
                    ></div>
                    <span
                      class="status-text"
                      :style="{
                        color: getStatusTextColor(record[column.key]),
                      }"
                    >
                      【{{
                        record[column.key].tag || record[column.key].status
                      }}】
                    </span>
                    <span>
                      {{ record[column.key].position }}
                      {{ record[column.key].timeRange }}
                    </span>
                  </div>
                </a-popover>
                <div
                  v-else
                  class="cell-content"
                  @click="() => handleCellClick(record, column.key)"
                >
                  <div
                    class="shift-cell"
                    :style="
                      getCellStyle(record[column.key], record.employee.type)
                    "
                  >
                    <div class="position">
                      {{ record[column.key].position }}
                    </div>
                    <div class="time-range">
                      {{ record[column.key].timeRange }}
                    </div>
                    <div class="shift-type">
                      <a-tag
                        :color="
                          record.employee.type === '正职' ? 'blue' : 'orange'
                        "
                        :bordered="false"
                      >
                        {{ record[column.key].shiftLabel }}
                      </a-tag>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="cell-content">
                <div class="rest-cell">休息</div>
              </div>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <ScheduleModal
      v-model:visible="isScheduleModalVisible"
      :store-id="activeStoreId"
      :employees="employees"
      :week-days="weekDays"
    />

    <ShiftAdjustModal
      v-model:visible="shiftAdjustModalState.visible"
      :modal-data="shiftAdjustModalState.data"
      @submit="fetchData"
    />

    <AddSupplementModal
      v-model:visible="isAddPersonModalVisible"
      :store-id="activeStoreId"
      :employees="employees"
      :week-days="weekDays"
      @submit="fetchData"
    />
  </div>
</template>

<style lang="less" scoped>
.scheduling-page-container {
  display: flex;
  height: calc(100vh - 88px);
  background-color: #f0f2f5;
  overflow: hidden;
}
.left-panel {
  width: 240px;
  background-color: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  padding: 16px;
  .search-section {
    margin-bottom: 16px;
  }
  .store-list {
    overflow-y: auto;
    flex-grow: 1;
    .store-item {
      padding: 12px;
      cursor: pointer;
      border-radius: 4px;
      margin-bottom: 8px;
      transition: background-color 0.3s;
      &:hover {
        background-color: #f5f5f5;
      }
      &.active {
        background-color: #e6f7ff;
        .store-name {
          color: #1890ff;
        }
      }
      .store-name {
        font-weight: 500;
      }
      .store-id {
        font-size: 12px;
        color: #888;
      }
    }
  }
}
.right-panel {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.filter-card,
.schedule-card {
  margin-bottom: 16px;
}
.schedule-card {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  :deep(.ant-table-wrapper) {
    flex-grow: 1;
    overflow: hidden;
  }
  :deep(.ant-table-body) {
    overflow-y: auto !important;
  }
}
.card-title-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.cell-content {
  height: 100%;
  width: 100%;
  cursor: pointer;
}
.shift-cell {
  text-align: left;
  padding: 4px 8px;
  border-radius: 4px;
  height: 100%;
  .position {
    font-weight: 500;
  }
  .time-range {
    font-size: 12px;
  }
  .shift-type {
    margin-top: 4px;
  }

  // 修复点: 动态样式已移至 getCellStyle, 此处仅保留结构
  &.light-text {
    color: #fff;
    .time-range {
      color: #f0f0f0;
    }
    :deep(.ant-tag) {
      background-color: rgba(255, 255, 255, 0.2) !important;
      border-color: rgba(255, 255, 255, 0.5) !important;
      color: #fff;
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
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
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
</style>
