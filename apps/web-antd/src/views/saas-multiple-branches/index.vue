<script setup lang="ts">
// 按照要求修改 import 语句
import { computed, onMounted, ref, watch } from 'vue';

// 按照要求修改 import 语句
import {
  LeftOutlined,
  PlusOutlined, // 新增图标
  RightOutlined,
} from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import dayjs, { Dayjs } from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import draggable from 'vuedraggable'; // 引入拖拽组件

// 1. 接口导入路径已修改
import { getWeeklySchedule, publishSchedule } from '#/api/hrp/schedules';
import { storesList } from '#/api/hrp/stores';

import AddSupplementModal from './AddSupplementModal.vue';
import ScheduleModal from './ScheduleModal.vue';
import ShiftAdjustModal from './ShiftAdjustModal.vue';

dayjs.extend(weekOfYear);

// ========== 数据模型定义 (已更新) ==========
interface Employee {
  id: number;
  name: string;
  type: '兼职' | '正职' | string;
  skills?: any[];
}
interface ShiftAssignment {
  id: string;
  position: string;
  timeRange: string;
  shiftLabel: string;
  colorCode?: string;
  userName: string;
  attendanceStatus?: '忘记打卡' | '缺勤' | '迟到' | string;
  startTime?: string;
  endTime?: string;
  // 【核心修改点】: 添加 remark 字段，用于存储额外信息
  remark?: string;
  // 【核心修改点】: 添加一个计算属性，用于解析 remark
  substitutionInfo?: {
    substitutedUserName: string;
  };
}
interface DaySchedule {
  date: string;
  shifts: ShiftAssignment[];
  isRestDay: boolean;
  // TODO: 新增字段, 记录最严重的考勤状态
  highestAttendanceIssue?: '忘记打卡' | '缺勤' | '迟到' | null;
}
interface ScheduleRow {
  employee: Employee;
  [date: string]: DaySchedule | Employee;
}

// ========== State 状态管理 ==========
const branches = ref<any[]>([]);
const storeId = ref<number | undefined>(undefined);
const currentDate = ref<Dayjs>(dayjs());
const columns = ref<any[]>([]); // 使用 any 以便存储 date 对象
const tableData = ref<ScheduleRow[]>([]);
const loading = ref(false);
const scheduleStatus = ref('DRAFT');

const scheduleModalVisible = ref(false);
const shiftAdjustModalVisible = ref(false);
const addSupplementModalVisible = ref(false);
const modalData = ref<any>({}); // 用于向弹窗传递通用数据

const isDraft = computed(() => scheduleStatus.value === 'DRAFT');

// ========== 日期与表头计算 ==========
const weekRangeText = computed(() => {
  const startOfWeek = currentDate.value.startOf('week');
  const endOfWeek = currentDate.value.endOf('week');
  return `${startOfWeek.format('YYYY/MM/DD')} - ${endOfWeek.format('YYYY/MM/DD')} (第${currentDate.value.week()}周)`;
});

const generateColumns = (dates: { date: string; label: string }[]) => {
  const newColumns: any[] = [
    {
      title: '员工',
      dataIndex: 'employee',
      key: 'employee',
      width: 120,
      fixed: 'left',
    },
  ];

  if (!dates) return newColumns;

  for (const dateInfo of dates) {
    const date = dayjs(dateInfo.date);
    newColumns.push({
      date: dateInfo.date, // 直接存储日期字符串
      label: dateInfo.label,
      displayDate: date.format('MM/DD'),
      key: dateInfo.date,
      width: 160,
    });
  }
  return newColumns;
};

// ========== API 数据获取与处理 ==========
const fetchData = async () => {
  if (!storeId.value) return;
  loading.value = true;
  try {
    const startOfWeek = currentDate.value.startOf('week').format('YYYY-MM-DD');
    const endOfWeek = currentDate.value.endOf('week').format('YYYY-MM-DD');

    const res = await getWeeklySchedule({
      storeId: storeId.value,
      startDate: startOfWeek,
      endDate: endOfWeek,
    });

    const apiData = res;
    scheduleStatus.value =
      apiData.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
    columns.value = generateColumns(apiData.dates);

    const newTableData: ScheduleRow[] = apiData.employees.map((emp) => {
      const scheduleRow: ScheduleRow = {
        employee: {
          id: emp.userId,
          name: emp.userName,
          type: emp.employeeType,
          skills: emp.skills,
        },
      };

      apiData.dates.forEach((dateInfo) => {
        const dateStr = dateInfo.date;
        const shiftsFromApi = apiData.scheduleRows[emp.userId]?.[dateStr] || [];

        // TODO: 计算当前单元格最严重的考勤问题
        let highestIssue: DaySchedule['highestAttendanceIssue'] = null;
        if (
          shiftsFromApi.some(
            (s) =>
              s.attendanceStatus === '缺勤' ||
              s.attendanceStatus === '忘记打卡',
          )
        ) {
          highestIssue = '缺勤'; // 缺勤和忘打卡都用橙色背景, 红色角标
        } else if (shiftsFromApi.some((s) => s.attendanceStatus === '迟到')) {
          highestIssue = '迟到';
        }

        const daySchedule: DaySchedule = {
          date: dateStr,
          highestAttendanceIssue: highestIssue, // 保存考勤状态
          shifts: shiftsFromApi.map((shift) => {
            const finalUserName = shift.userName || emp.userName;
            const timeRange =
              shift.startTime && shift.endTime
                ? `${shift.startTime.slice(0, 5)} - ${shift.endTime.slice(0, 5)}`
                : '时间未知';
            let substitutionInfo;
            if (shift.remark) {
              try {
                const remarkData = JSON.parse(shift.remark);
                if (remarkData.type === 'BREAK_COVERAGE') {
                  substitutionInfo = {
                    substitutedUserName:
                      remarkData.substitutedUserName || '未知员工',
                  };
                }
              } catch {
                console.error('解析 remark 失败', shift.remark);
              }
            }

            return {
              id: shift.id,
              positionSkill: shift.skillName,
              positionShift: shift.shiftName,
              timeRange,
              shiftLabel: shift.shiftName,
              shiftCode: shift.shiftCode,
              skillId: shift.skillId,
              userId: shift.userId,
              colorCode: shift.colorCode,
              isSubstitute: shift.attendanceStatus === '增补',
              userName: finalUserName,
              attendanceStatus: shift.attendanceStatus, // 传递考勤状态
              startTime: shift.startTime, // 保留原始数据
              endTime: shift.endTime, // 保留原始数据
              substitutionInfo, // 传递替换信息
            };
          }),
          isRestDay: shiftsFromApi.length === 0,
        };
        scheduleRow[dateStr] = daySchedule;
      });

      return scheduleRow;
    });

    tableData.value = newTableData;
  } catch (error) {
    console.error('获取排班数据失败', error);
    message.error('获取排班数据失败');
    tableData.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  const res = await storesList();
  branches.value = res.rows;
  if (branches.value.length > 0) {
    storeId.value = branches.value[0].id;
    await fetchData();
  }
});

watch(storeId, fetchData);

// ========== 日期切换 ==========
const prevWeek = () => {
  currentDate.value = currentDate.value.subtract(1, 'week');
  fetchData();
};
const nextWeek = () => {
  currentDate.value = currentDate.value.add(1, 'week');
  fetchData();
};

// ========== 弹窗操作 ==========
const openShiftAdjustModal = (shiftInfo, employee, dayKey) => {
  modalData.value = {
    shift: shiftInfo,
    employee,
    dayKey,
    storeId: storeId.value,
    isPublished: !isDraft.value,
  };
  shiftAdjustModalVisible.value = true;
};

const triggerAutoSchedule = () => {
  modalData.value = {
    initialDate: currentDate.value.format('YYYY-MM-DD'),
  };
  scheduleModalVisible.value = true;
};

// ========== 发布排班 ==========
const handlePublish = () => {
  Modal.confirm({
    title: '确认发布排班?',
    content: '发布后，排班将对员工可见，且无法进行大规模调整。',
    onOk: async () => {
      try {
        await publishSchedule({
          storeId: storeId.value,
          startDate: currentDate.value.startOf('week').format('YYYY-MM-DD'),
          endDate: currentDate.value.endOf('week').format('YYYY-MM-DD'),
        });
        message.success('发布成功');
        fetchData(); // 重新获取数据, 状态会变为 PUBLISHED
      } catch (error) {
        console.error('发布失败', error);
        message.error('发布失败');
      }
    },
  });
};

// ========== 拖拽逻辑 ==========
const onDragEnd = (event, employeeId) => {
  const { oldIndex, newIndex, item } = event;
  if (oldIndex === newIndex) return;

  const shiftId = item.dataset.shiftId;
  const fromDate = item.dataset.date;
  const toDate = columns.value[newIndex + 1]?.key as string;

  if (!toDate) {
    console.warn('拖拽目标位置无效');
    fetchData();
    return;
  }

  console.log(
    `拖拽操作: 员工ID: ${employeeId}, 班次ID: ${shiftId}, 从: ${fromDate}, 到: ${toDate}`,
  );
  message.info(`模拟调整: 班次 ${shiftId} 已从 ${fromDate} 移至 ${toDate}`);

  const employeeRow = tableData.value.find(
    (row) => row.employee.id === employeeId,
  );
  if (employeeRow) {
    const fromDay = employeeRow[fromDate] as DaySchedule;
    const toDay = employeeRow[toDate] as DaySchedule;
    if (fromDay && toDay) {
      const shiftIndex = fromDay.shifts.findIndex((s) => s.id === shiftId);
      if (shiftIndex !== -1) {
        const [movedShift] = fromDay.shifts.splice(shiftIndex, 1);
        toDay.shifts.push(movedShift);
      }
    }
  }
};

// ========== 样式计算逻辑 ==========
const getShiftStyle = (shift: ShiftAssignment, employeeType: string) => {
  // 优先级 1: 考勤异常状态覆盖所有颜色
  if (!isDraft.value && shift.attendanceStatus === '迟到') {
    return { backgroundColor: '#f5222d', borderColor: '#a8071a' };
  }

  // 优先级 2: "兼职" 员工的班次特殊处理
  if (employeeType === '兼职') {
    // 【核心修改点】: 如果是替班 (substitutionInfo 存在)，则使用后端提供的特殊颜色
    if (shift.substitutionInfo && shift.colorCode) {
      return {
        backgroundColor: shift.colorCode, // 后端为替班设置的颜色 (例如: #B39DDB)
        borderColor: `color-mix(in srgb, ${shift.colorCode} 70%, #000 30%)`,
      };
    }
    // 如果是兼职的普通班次，则显示深橙色
    return { backgroundColor: '#D97E00', borderColor: '#B36600' };
  }

  // 优先级 3: (全职) 优先使用后端返回的颜色
  if (shift.colorCode) {
    return {
      backgroundColor: shift.colorCode,
      borderColor: `color-mix(in srgb, ${shift.colorCode} 70%, #000 30%)`,
    };
  }

  // 优先级 4: 如果后端没有颜色，使用旧的基于班次名称的逻辑作为后备
  if (shift.shiftLabel?.includes('全')) {
    return { backgroundColor: '#369EFF', borderColor: '#006DFF' };
  }
  if (shift.shiftLabel?.includes('早')) {
    return { backgroundColor: '#00C29A', borderColor: '#00A37F' };
  }
  if (shift.shiftLabel?.includes('晚')) {
    return { backgroundColor: '#FFB800', borderColor: '#D99800' };
  }

  // 默认颜色
  return { backgroundColor: '#86909c', borderColor: '#4e5969' };
};

const getCellClass = (day: DaySchedule) => {
  if (!day || isDraft.value) return '';
  // #1 "迟到" 不再改变单元格背景色, 只改变卡片颜色
  switch (day.highestAttendanceIssue) {
    case '忘记打卡': {
      return 'cell-status-forgot';
    }
    case '缺勤': {
      return 'cell-status-absent';
    }
    default: {
      return '';
    }
  }
};
</script>
<template>
  <div class="schedule-page-container">
    <a-card class="header-card" :bordered="false">
      <a-row justify="space-between" align="middle">
        <a-col>
          <a-space>
            <a-select
              v-model:value="storeId"
              placeholder="选择分店"
              style="width: 150px"
            >
              <a-select-option v-for="b in branches" :key="b.id" :value="b.id">
                {{ b.name }}
              </a-select-option>
            </a-select>
            <a-button @click="prevWeek"><LeftOutlined /></a-button>
            <span class="week-range-text">{{ weekRangeText }}</span>
            <a-button @click="nextWeek"><RightOutlined /></a-button>
          </a-space>
        </a-col>
        <a-col>
          <a-space>
            <a-tag v-if="isDraft" color="blue">草稿状态</a-tag>
            <a-tag v-else color="green">已发布</a-tag>
            <a-button type="dashed" v-if="isDraft" @click="triggerAutoSchedule">
              手动排班
            </a-button>
            <a-button type="primary" v-if="isDraft" @click="handlePublish">
              发布排班
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <div
      class="schedule-grid-container"
      v-if="!loading && tableData.length > 0"
    >
      <div
        class="schedule-grid"
        :style="{
          'grid-template-columns': `120px repeat(${columns.length - 1}, 1fr)`,
        }"
      >
        <div class="grid-header sticky-col">员工</div>
        <div
          v-for="col in columns.slice(1)"
          :key="col.key"
          class="grid-header sticky-header"
        >
          <div class="date-text">{{ col.displayDate }}</div>
          <div class="day-of-week">{{ col.label }}</div>
        </div>

        <template
          v-for="employeeRow in tableData"
          :key="employeeRow.employee.id"
        >
          <div class="employee-cell sticky-col">
            <div class="employee-name-text">
              {{ employeeRow.employee.name }}
            </div>
            <div class="employee-type-text">
              {{ employeeRow.employee.type }}
            </div>
          </div>

          <draggable
            :list="columns.slice(1)"
            group="columns"
            item-key="key"
            class="contents"
            :disabled="true"
          >
            <template #item="{ element: col }">
              <div
                class="schedule-cell"
                :class="getCellClass(employeeRow[col.key] as DaySchedule)"
              >
                <div
                  v-if="
                    !isDraft &&
                    (employeeRow[col.key] as DaySchedule).highestAttendanceIssue
                  "
                  class="corner-flag"
                ></div>
                <draggable
                  :list="(employeeRow[col.key] as DaySchedule).shifts"
                  :group="{ name: `schedule-group-${employeeRow.employee.id}` }"
                  item-key="id"
                  class="shift-list"
                  :disabled="!isDraft"
                  @end="(event) => onDragEnd(event, employeeRow.employee.id)"
                  :move="() => isDraft"
                >
                  <template #item="{ element: shift }">
                    <div
                      class="shift-card"
                      :style="getShiftStyle(shift, employeeRow.employee.type)"
                      @click.stop="
                        openShiftAdjustModal(
                          shift,
                          employeeRow.employee,
                          col.key,
                        )
                      "
                      :data-shift-id="shift.id"
                      :data-date="col.key"
                    >
                      <a-tooltip
                        :title="
                          shift.substitutionInfo
                            ? `为 ${shift.substitutionInfo.substitutedUserName} 替班`
                            : ''
                        "
                      >
                        <div class="shift-card-header">
                          <span class="position">{{
                            shift.positionSkill
                          }}</span>
                          <span class="position">{{
                            shift.positionShift
                          }}</span>
                          <a-tag
                            v-if="shift.attendanceStatus"
                            color="orange"
                            class="sub-tag"
                          >
                            {{
                              shift.attendanceStatus === '增补'
                                ? '替'
                                : shift.attendanceStatus[0]
                            }}
                          </a-tag>
                        </div>
                        <div class="time-range">{{ shift.timeRange }}</div>
                      </a-tooltip>
                    </div>
                  </template>
                </draggable>
                <div
                  v-if="(employeeRow[col.key] as DaySchedule).isRestDay"
                  class="day-off"
                >
                  休
                </div>
                <a-button
                  v-if="
                    !(employeeRow[col.key] as DaySchedule).isRestDay &&
                    isDraft &&
                    (employeeRow[col.key] as DaySchedule).shifts.length === 0
                  "
                  class="add-shift-btn"
                  type="text"
                  shape="circle"
                  @click.stop="
                    () => {
                      modalData = {
                        employee: employeeRow.employee,
                        date: col.date,
                      };
                      scheduleModalVisible = true;
                    }
                  "
                >
                  <PlusOutlined />
                </a-button>
              </div>
            </template>
          </draggable>
        </template>
      </div>
    </div>
    <a-spin
      :spinning="loading"
      size="large"
      tip="正在加载排班表..."
      class="mt-10 w-full"
      v-else
    />

    <ScheduleModal
      v-model:visible="scheduleModalVisible"
      :store-id="storeId"
      :initial-data="modalData"
      @submit="fetchData"
    />
    <ShiftAdjustModal
      v-model:visible="shiftAdjustModalVisible"
      :modal-data="modalData"
      @submit="fetchData"
    />
    <AddSupplementModal
      v-model:visible="addSupplementModalVisible"
      :store-id="storeId"
      :employees="modalData.employees"
      :week-days="modalData.weekDays"
      @submit="fetchData"
    />
  </div>
</template>
<style lang="less" scoped>
.schedule-page-container {
  padding: 16px;
  background-color: #f0f2f5;
  height: calc(100vh - 88px);
  display: flex;
  flex-direction: column;
}

.header-card {
  margin-bottom: 16px;
  flex-shrink: 0;
  .week-range-text {
    font-size: 16px;
    font-weight: 500;
    margin: 0 8px;
  }
}

.schedule-grid-container {
  flex-grow: 1;
  overflow: auto;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
}

.schedule-grid {
  display: grid;
  width: max-content;
  min-width: 100%;
}

.grid-header,
.employee-cell {
  text-align: center;
  font-size: 14px;
  padding: 8px;
  background-color: #fafafa;
  border-bottom: 1px solid #e8e8e8;
  border-right: 1px solid #e8e8e8;
}

.grid-header {
  font-weight: 600;
  color: #333;
  .date-text {
    font-size: 14px;
  }
  .day-of-week {
    font-size: 12px;
    color: #666;
  }
}

.employee-cell {
  font-weight: 500;
  padding: 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  .employee-name-text {
    font-weight: bold;
  }
  .employee-type-text {
    font-size: 12px;
    color: #888;
  }
}

.sticky-col,
.sticky-header {
  position: sticky;
  z-index: 1;
}
.sticky-col {
  left: 0;
  z-index: 2;
  border-right: 2px solid #d9d9d9;
}
.sticky-header {
  top: 0;
}
.grid-header.sticky-col {
  z-index: 3;
}

.schedule-cell {
  border-right: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
  padding: 4px;
  min-height: 100px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: background-color 0.3s;

  .day-off {
    font-size: 16px;
    font-weight: 500;
    color: #888;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

// TODO: #5 新增考勤状态样式
.cell-status-late {
  background-color: #fff1f0;
} // 红色背景
.cell-status-absent,
.cell-status-forgot {
  background-color: #fffbe6;
} // 橙色背景

.corner-flag {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 12px 12px 0 0;
  z-index: 2;
}
.cell-status-late .corner-flag,
.cell-status-forgot .corner-flag {
  border-color: #ff4d4f transparent transparent transparent; // 红色
}
.cell-status-absent .corner-flag {
  border-color: #faad14 transparent transparent transparent; // 橙色
}

.shift-list {
  width: 100%;
  min-height: 70px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.shift-card {
  padding: 4px 8px;
  border-radius: 4px;
  color: #fff;
  cursor: grab;
  border-left: 5px solid;
  transition: all 0.2s ease-in-out;
  position: relative;
  z-index: 1;

  &:active {
    cursor: grabbing;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10;
  }

  .shift-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .position {
      font-weight: 500;
      font-size: 13px;
    }
    .sub-tag {
      height: 16px;
      line-height: 14px;
      padding: 0 4px;
      font-size: 10px;
      border-radius: 2px;
      margin-left: 4px;
    }
  }
  .time-range {
    font-size: 12px;
    opacity: 0.9;
  }
}

.sortable-ghost {
  opacity: 0.4;
  background-color: #cce5ff;
  border: 1px dashed #007bff;
}
.sortable-chosen {
  opacity: 0.8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

// TODO: #3 调整新增按钮样式
.add-shift-btn {
  width: 28px;
  height: 28px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: #888;
  border: 1px dashed #d9d9d9;

  &:hover {
    color: #1677ff;
    border-color: #1677ff;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.schedule-cell:hover .add-shift-btn {
  // 只有在草稿模式下, 并且没有班次时才显示
  opacity: 1;
}

.contents {
  display: contents;
}
</style>
