<script setup lang="ts">
import type { TableColumnType } from 'ant-design-vue';

import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { InfoCircleOutlined } from '@ant-design/icons-vue';
import { Modal } from 'ant-design-vue';

import ScheduleModal from './ScheduleModal.vue';

const router = useRouter();

// ========== 数据模型定义 ==========

type ShiftType = 'FullTime' | 'PartTimeEvening' | 'PartTimeMorning';

interface Employee {
  id: number;
  name: string;
  type: '兼职' | '正职';
  skills?: string[];
  daysOff?: string[];
}

interface ShiftAssignment {
  position: string;
  timeRange: string;
  duration: number;
  shiftType: ShiftType;
  shiftLabel: string;
}

interface ScheduleRow {
  key: number;
  employee: Employee;
  [day: string]: any;
}

interface Store {
  id: string;
  name: string;
}

// ========== Mock 数据 ==========

const activeStoreId = ref('0914');
const isScheduleModalVisible = ref(false);

const stores = reactive<Store[]>([
  { id: '0914', name: 'XXX分店' },
  { id: '0915', name: 'XXX分店' },
]);

const employees = reactive<Employee[]>([
  {
    id: 1,
    name: '张小花',
    type: '正职',
    skills: ['柜台', '外场', '内场'],
    daysOff: [],
  },
  {
    id: 2,
    name: '李小明',
    type: '正职',
    skills: ['内场', '洗碗', '清洁'],
    daysOff: [],
  },
  {
    id: 3,
    name: '王小红',
    type: '正职',
    skills: ['柜台', '外场'],
    daysOff: [],
  },
  {
    id: 4,
    name: '赵小刚',
    type: '正职',
    skills: ['内场', '清洁', '外场'],
    daysOff: [],
  },
  {
    id: 5,
    name: '孙小美',
    type: '正职',
    skills: ['柜台', '洗碗'],
    daysOff: [],
  },
  {
    id: 6,
    name: '周小强',
    type: '兼职',
    skills: ['外场', '清洁'],
    daysOff: [],
  },
  {
    id: 7,
    name: '吴小丽',
    type: '兼职',
    skills: ['内场', '洗碗'],
    daysOff: [],
  },
  { id: 8, name: '郑小伟', type: '兼职', skills: ['柜台'], daysOff: [] },
]);

const scheduleData = reactive<ScheduleRow[]>([]);

const weekDays = [
  { label: '星期一 (8.11)', key: 'monday' },
  { label: '星期二 (8.12)', key: 'tuesday' },
  { label: '星期三 (8.13)', key: 'wednesday' },
  { label: '星期四 (8.14)', key: 'thursday' },
  { label: '星期五 (8.15)', key: 'friday' },
  { label: '星期六 (8.16)', key: 'saturday' },
  { label: '星期日 (8.17)', key: 'sunday' },
];

const scheduleTableColumns: TableColumnType[] = [
  {
    title: '员工',
    key: 'employeeName',
    dataIndex: ['employee', 'name'],
    fixed: 'left',
    width: 120,
  },
  ...weekDays.map((day) => ({
    title: day.label,
    key: day.key,
    dataIndex: day.key,
    align: 'center',
    width: 180,
  })),
];

// ========== 班次调整 Modal 状态管理 ==========
const goToHistory = () => {
  router.push('/schedule/history');
};
const shiftModalState = reactive({
  visible: false,
  date: '',
  shift: null as null | ShiftAssignment,
  employeeName: '',
  originalRecord: null as null | ScheduleRow,
  dayKey: '',
  isAdjusting: false,
  splitShift: false,
  newEmployeeId: null as null | number,
  splitAssignments: [] as { employeeId: null | number; timeRange: string }[],
});

const openShiftModal = (record: ScheduleRow, dayKey: string) => {
  const dayInfo = weekDays.find((d) => d.key === dayKey);
  if (!dayInfo || !record[dayKey]) return;

  shiftModalState.date = dayInfo.label;
  shiftModalState.shift = record[dayKey];
  shiftModalState.employeeName = record.employee.name;
  shiftModalState.originalRecord = record;
  shiftModalState.dayKey = dayKey;

  shiftModalState.isAdjusting = false;
  shiftModalState.splitShift = false;
  shiftModalState.newEmployeeId = record.employee.id;

  shiftModalState.splitAssignments = [
    { timeRange: '09:00 ~ 14:00', employeeId: null },
    { timeRange: '14:00 ~ 18:00', employeeId: null },
  ];

  shiftModalState.visible = true;
};

// ========== 业务逻辑 ==========

const initializeSchedule = () => {
  scheduleData.length = 0;
  employees.forEach((emp) => {
    const row: ScheduleRow = {
      key: emp.id,
      employee: emp,
    };
    weekDays.forEach((day) => {
      row[day.key] = null;
    });
    scheduleData.push(row);
  });
};

const handleResetSchedule = () => {
  Modal.confirm({
    title: '确认操作',
    content: '确定要重置排班表吗？所有已安排的班次都将被清空。',
    okText: '确认重置',
    cancelText: '取消',
    onOk: () => {
      initializeSchedule();
      Modal.success({ title: '操作成功', content: '排班表已重置为初始状态。' });
    },
  });
};

const handleShiftUpdate = () => {
  if (!shiftModalState.isAdjusting) {
    shiftModalState.visible = false;
    return;
  }

  const originalRow = scheduleData.find(
    (r) => r.key === shiftModalState.originalRecord?.key,
  );
  if (!originalRow) return;

  // 不拆分班次，只换人
  if (shiftModalState.splitShift) {
    // 移除原班次
    originalRow[shiftModalState.dayKey] = null;
    // 为被指派的员工添加新班次
    shiftModalState.splitAssignments.forEach((assign) => {
      if (assign.employeeId) {
        const assignedRow = scheduleData.find(
          (r) => r.key === assign.employeeId,
        );
        if (assignedRow) {
          // 实际应用中需要更复杂的逻辑来创建新的班次对象
          assignedRow[shiftModalState.dayKey] = {
            position: shiftModalState.shift?.position || '未知',
            timeRange: assign.timeRange.replace(' ~ ', '-'),
            duration: 4, // 简化计算
            shiftType: 'PartTimeMorning',
            shiftLabel: '兼职-拆分',
          };
        }
      }
    });
  }
  // 拆分班次
  else {
    const newEmployee = employees.find(
      (e) => e.id === shiftModalState.newEmployeeId,
    );
    if (!newEmployee) return;

    // 找到新员工的排班行
    const newEmployeeRow = scheduleData.find((r) => r.key === newEmployee.id);
    if (!newEmployeeRow) return;

    // 交换班次
    const tempShift = originalRow[shiftModalState.dayKey];
    newEmployeeRow[shiftModalState.dayKey] = { ...tempShift };
    originalRow[shiftModalState.dayKey] = null; // 原员工当天休息
  }

  shiftModalState.visible = false;
  Modal.success({ title: '操作成功', content: '班次已成功调整！' });
};

const handleScheduleSubmit = (newSchedule) => {
  initializeSchedule(); // 先清空
  // 将算法返回的结果应用到 scheduleData
  Object.keys(newSchedule).forEach((employeeId) => {
    const row = scheduleData.find(
      (r) => r.key === Number.parseInt(employeeId, 10),
    );
    if (row) {
      const dailyAssignments = newSchedule[employeeId];
      Object.keys(dailyAssignments).forEach((dayKey) => {
        row[dayKey] = dailyAssignments[dayKey];
      });
    }
  });
};

const getShiftCellStyle = (shift: ShiftAssignment) => {
  if (!shift) return {};
  switch (shift.shiftType) {
    case 'FullTime': {
      return { background: 'rgba(68, 99, 255, 1)' };
    }
    case 'PartTimeEvening': {
      return {
        background:
          'linear-gradient(to left, rgba(221, 172, 51, 0.2), rgba(221, 172, 51, 0.05))',
      };
    }
    case 'PartTimeMorning': {
      return {
        background:
          'linear-gradient(to right, rgba(221, 172, 51, 0.2), rgba(221, 172, 51, 0.05))',
      };
    }
    default: {
      return {};
    }
  }
};

onMounted(() => {
  initializeSchedule();
});
</script>

<template>
  <div class="scheduling-page-container">
    <!-- 左侧门店选择区域 -->
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

    <!-- 右侧主内容区域 -->
    <div class="right-panel">
      <!-- 面包屑导航 -->
      <a-breadcrumb class="breadcrumb-section">
        <a-breadcrumb-item>智慧门店</a-breadcrumb-item>
        <a-breadcrumb-item>门店排班</a-breadcrumb-item>
        <a-breadcrumb-item>周度排班</a-breadcrumb-item>
      </a-breadcrumb>

      <!-- 筛选和操作栏 -->
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

      <!-- 排班表格 -->
      <a-card :bordered="false" class="schedule-card">
        <template #title>
          <div class="card-title-wrapper">
            <span>周度排班表</span>
            <a-space>
              <a-button @click="goToHistory">查看历史排班</a-button>
              <a-button @click="handleResetSchedule">重置排班表</a-button>
              <a-button type="primary" @click="isScheduleModalVisible = true">
                智能排班
              </a-button>
            </a-space>
          </div>
        </template>
        <a-table
          :columns="scheduleTableColumns"
          :data-source="scheduleData"
          :pagination="false"
          bordered
          size="middle"
          :scroll="{ x: 1200 }"
        >
          <template #bodyCell="{ column, record }">
            <!-- 员工姓名列 -->
            <template v-if="column.key === 'employeeName'">
              <a-space align="center">
                <span>{{ record.employee.name }}</span>
                <InfoCircleOutlined style="color: #1890ff; cursor: pointer" />
              </a-space>
            </template>
            <!-- 每日排班单元格 -->
            <template
              v-else-if="
                weekDays.map((d) => d.key).includes(column.key as string)
              "
            >
              <div
                v-if="record[column.key]"
                class="shift-cell"
                :style="getShiftCellStyle(record[column.key])"
                :class="{ 'light-text': record.employee.type === '正职' }"
                @click="openShiftModal(record, column.key as string)"
              >
                <div class="position">{{ record[column.key].position }}</div>
                <div class="time-range">
                  {{ record[column.key].timeRange }} ({{
                    record[column.key].duration
                  }}h)
                </div>
                <div class="shift-type">
                  <a-tag
                    :color="
                      record.employee.type === '正职' ? 'white' : 'orange'
                    "
                    :bordered="false"
                  >
                    {{ record[column.key].shiftLabel }}
                  </a-tag>
                </div>
              </div>
              <div v-else class="rest-cell">休息</div>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 班次调整 Modal -->
    <a-modal
      v-model:visible="shiftModalState.visible"
      :footer="null"
      :closable="false"
      width="400px"
    >
      <template #title>
        <div class="modal-title">
          {{ shiftModalState.date }}
        </div>
      </template>
      <div class="modal-content">
        <a-descriptions :column="1" bordered size="small">
          <a-descriptions-item label="岗位">
            {{ shiftModalState.shift?.position }}
          </a-descriptions-item>
          <a-descriptions-item label="班次">
            {{ shiftModalState.shift?.timeRange }}
          </a-descriptions-item>
          <a-descriptions-item label="当班员工">
            {{ shiftModalState.employeeName }}
          </a-descriptions-item>
        </a-descriptions>

        <a-divider />

        <a-form layout="vertical">
          <a-form-item label="调整">
            <a-switch v-model:checked="shiftModalState.isAdjusting" />
          </a-form-item>

          <template v-if="shiftModalState.isAdjusting">
            <a-form-item label="拆分班次">
              <a-radio-group v-model:value="shiftModalState.splitShift">
                <a-radio :value="true">是</a-radio>
                <a-radio :value="false">否</a-radio>
              </a-radio-group>
            </a-form-item>

            <a-form-item v-if="!shiftModalState.splitShift" label="员工调整">
              <a-select
                v-model:value="shiftModalState.newEmployeeId"
                style="width: 100%"
              >
                <a-select-option
                  v-for="emp in employees"
                  :key="emp.id"
                  :value="emp.id"
                >
                  {{ emp.name }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-space
              v-if="shiftModalState.splitShift"
              direction="vertical"
              style="width: 100%"
            >
              <a-row
                v-for="(split, index) in shiftModalState.splitAssignments"
                :key="index"
                :gutter="8"
                align="middle"
              >
                <a-col :span="10">{{ split.timeRange }}</a-col>
                <a-col :span="14">
                  <a-select
                    v-model:value="split.employeeId"
                    style="width: 100%"
                  >
                    <a-select-option
                      v-for="emp in employees"
                      :key="emp.id"
                      :value="emp.id"
                    >
                      {{ emp.name }}
                    </a-select-option>
                  </a-select>
                </a-col>
              </a-row>
            </a-space>
          </template>
        </a-form>

        <div class="modal-footer">
          <a-button @click="shiftModalState.visible = false">关闭</a-button>
          <a-button type="primary" @click="handleShiftUpdate">确认</a-button>
        </div>
      </div>
    </a-modal>

    <!-- 智能排班配置弹窗 -->
    <ScheduleModal
      v-model:visible="isScheduleModalVisible"
      :employees="employees"
      :week-days="weekDays"
      @submit="handleScheduleSubmit"
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
  line-height: 1.5;
  border-radius: 4px;
  height: 100%;
  transition: background 0.3s;
  cursor: pointer;

  &:hover {
    opacity: 0.85;
  }

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

  .position {
    font-weight: 500;
  }

  .time-range {
    font-size: 12px;
    color: #555;
  }

  .shift-type {
    margin-top: 4px;
  }
}

.rest-cell {
  color: #aaa;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

// Modal Styles
.modal-title {
  text-align: center;
  font-size: 18px;
  font-weight: 500;
}
.modal-content {
  padding: 0 8px;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
}
.mt-4 {
  margin-top: 16px;
}
</style>
