<script setup lang="tsx">
import type { StoreEventsVO } from '../storeEvents/model';

import type { SkillsVO } from '#/api/hrp/skills/model';
import type { Availability } from '#/api/hrp/userAvailability/model';

import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';

import {
  BarChartOutlined,
  CoffeeOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  GoldOutlined,
  HourglassOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  TeamOutlined,
} from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';

import { weekDayMap } from '#/api/common.d.ts';
import { shiftsAndRestTime } from '#/api/hrp/shifts';
import { skillsList } from '#/api/hrp/skills';
import { storesList } from '#/api/hrp/stores';
import { listUserprofileWithSkills } from '#/api/hrp/userProfile';

import EmployeeEditModal from './EmployeeEditModal.vue'; // 引入新的员工编辑弹窗

// =================================================================================
// 模拟角色与数据 (MOCK)
// =================================================================================
const userRole = ref('admin'); // 'admin' or 'store'
const loggedInStoreId = 2;
// =================================================================================
// 响应式状态管理
// =================================================================================
const loading = ref(false);
const activeStoreId = ref<number | undefined>(undefined); // 初始不选

// --- 数据源 ---
const allStores = ref<StoreEventsVO[]>([]);
const allSkills = ref<SkillsVO[]>([]);
// --- 各面板的数据 ---
const employees = ref([]);

// --- 弹窗状态 ---
const isEmployeeModalVisible = ref(false);
const currentEditingEmployee = ref(null);
const isCopySettingsModalVisible = ref(false);
const isUserAuthModalVisible = ref(false);
const copySettingsForm = reactive({
  sourceStoreId: null,
  targetStoreIds: [],
  copyItems: [],
});

// --- 权限面板状态 ---
const authorizedUsers = ref([]);
const supportTargetKeys = ref([]);

// --- 模拟数据 ---
const mockAllSystemUsers = [
  // MOCK: 此处应通过API获取系统内所有可供选择的用户
  { key: 101, title: '张三' },
  { key: 102, title: '李四' },
  { key: 2001, title: '王五' },
  { key: 2002, title: '赵六' },
  { key: 3001, title: '孙七' },
];

// --- 权限面板方法 ---
const loadPermissionsData = (storeId) => {
  // MOCK: 此处应根据 storeId 调用API获取权限数据
  console.log(`Fetching permission data for storeId: ${storeId}`);
  // 模拟已授权用户
  authorizedUsers.value = [
    { id: 101, name: '张三', position: '店长' },
    { id: 102, name: '李四', position: '排班经理' },
  ];
  // 模拟跨店支援关系 (假设西溪店可以支援中心旗舰店和滨江宝龙店)
  supportTargetKeys.value = storeId === 2 ? [1, 3] : [];
};

const handleAddUserAuth = () => {
  isUserAuthModalVisible.value = true;
};

const handleUserAuthOk = (selectedUserIds) => {
  // MOCK: 调用API，为当前店铺批量添加用户权限
  console.log(
    `Adding users ${selectedUserIds} to store ${activeStoreId.value}`,
  );
  message.success('授权成功');
  loadPermissionsData(activeStoreId.value); // 刷新列表
  isUserAuthModalVisible.value = false;
};

const handleRemoveUserAuth = (userId) => {
  Modal.confirm({
    title: '确认移除该人员的权限吗？',
    content: '移除后，该人员将无法访问本店的排班及配置信息。',
    onOk: () => {
      // MOCK: 调用API，移除用户权限
      console.log(`Removing user ${userId} from store ${activeStoreId.value}`);
      message.success('移除成功');
      loadPermissionsData(activeStoreId.value); // 刷新列表
    },
  });
};

const handleSupportChange = (targetKeys) => {
  supportTargetKeys.value = targetKeys;
};

const handleSaveSupportSettings = () => {
  // MOCK: 调用API，保存新的跨店支援关系
  console.log(
    `Saving support relations for store ${activeStoreId.value}:`,
    supportTargetKeys.value,
  );
  message.success('跨店支援关系已保存');
};

const openCopySettingsModal = () => {
  copySettingsForm.sourceStoreId = activeStoreId.value;
  isCopySettingsModalVisible.value = true;
};

const handleCopySettings = () => {
  // MOCK: 调用后台API执行配置复制
  console.log('Copying settings:', copySettingsForm);
  message.success('配置复制任务已提交');
  isCopySettingsModalVisible.value = false;
};

// --- 人力需求面板状态 ---
const requirements = reactive<{
  holiday: any[];
  special: any[];
  weekday: any[];
}>({
  weekday: [],
  holiday: [],
  special: [],
});
const isSpecialDayModalVisible = ref(false);
const specialDayForm = reactive({
  date: null,
  name: '',
  requirements: [],
});

// --- 人力需求面板方法 ---
const getRequirementCount = (
  type: 'holiday' | 'special' | 'weekday',
  shiftId: number,
  skillId: number,
  source = requirements,
) => {
  const reqSource = type === 'special' ? source.requirements : source[type];
  const found = reqSource.find(
    (r) => r.shiftId === shiftId && r.skillId === skillId,
  );
  return found ? found.count : 0;
};

const setRequirementCount = (
  type: 'holiday' | 'special' | 'weekday',
  shiftId: number,
  skillId: number,
  count: number,
  source = requirements,
) => {
  const reqSource = type === 'special' ? source.requirements : source[type];
  const found = reqSource.find(
    (r) => r.shiftId === shiftId && r.skillId === skillId,
  );
  if (found) {
    found.count = count;
  } else {
    reqSource.push({ shiftId, skillId, count });
  }
};

const handleSaveRequirements = (type: 'holiday' | 'weekday') => {
  // MOCK: 此处应调用批量保存人力需求的API
  const typeName = type === 'weekday' ? '平日' : '假日';
  console.log(
    `Saving ${typeName} requirements for store ${activeStoreId.value}:`,
    requirements[type],
  );
  message.success(`${typeName}需求保存成功`);
};

const handleAddSpecialDay = () => {
  Object.assign(specialDayForm, { date: null, name: '', requirements: [] });
  isSpecialDayModalVisible.value = true;
};

const handleEditSpecialDay = (day) => {
  Object.assign(specialDayForm, JSON.parse(JSON.stringify(day)));
  isSpecialDayModalVisible.value = true;
};

const handleSpecialDayOk = () => {
  // MOCK: 此处应调用新增或编辑特殊日需求的API
  console.log('Saving special day requirement:', specialDayForm);
  message.success('特殊日需求已保存');
  isSpecialDayModalVisible.value = false;
  loadWorkbenchData(activeStoreId.value); // 刷新数据
};

// --- 表格列定义 ---
const requirementColumns = computed<TableColumnType[]>(() => [
  { title: '班次', dataIndex: 'name', width: 150, fixed: 'left' },
  ...allSkills.value.map((skill) => ({
    title: skill.name,
    dataIndex: 'requirements',
    key: skill.id,
    width: 100,
    align: 'center',
  })),
]);

// --- 规则设定面板状态 ---
const rulesSettings = reactive({
  // 休假规则
  leaveRules: {
    allowLeaveRequest: true,
    lockAfterPublish: true,
    allowRestSelection: false,
    maxFullTimeLeave: 2,
  },
  // 工时规则
  workingHoursRules: {
    fullTime: {
      monthlyRestDays: 8,
    },
    partTime: {
      minMonthlyRestDays: 8,
      maxWeeklyHours: 40,
    },
    general: {
      maxWeeklyWorkDays: 6,
      maxConsecutiveWorkDays: 6,
    },
  },
});

// --- 规则设定方法 ---
const loadRulesData = async (storeId) => {
  // MOCK: 此处应根据 storeId 调用API获取店铺的规则配置
  console.log(`Fetching rules data for storeId: ${storeId}`);
  // 实际开发中，你会用API返回的数据来覆盖 `rulesSettings` 的默认值
  // 例如: Object.assign(rulesSettings, await fetchRulesAPI(storeId));
};

const handleSaveRules = () => {
  // MOCK: 此处应调用API，将 `rulesSettings` 对象整体提交到后台保存
  console.log(`Saving rules for store ${activeStoreId.value}:`, rulesSettings);
  message.success('休假与工时规则已保存');
};

// --- “基本设定”面板状态 ---
const shifts = ref([]);
const basicSettings = reactive({
  crossDayRule: 'by_shift_start',
  employeeTypes: ['全职', '兼职'], // 按照要求简化
});

// --- 班别设定弹窗状态 ---
const isShiftModalVisible = ref(false);
const shiftForm = reactive<{
  breakTimes?: { id: number; range?: [Dayjs, Dayjs] | [string, string] }[];
  code?: string;
  color?: string;
  id?: number;
  isCrossDay?: boolean;
  name?: string;
  timeRange?: [Dayjs, Dayjs] | [string, string];
}>({});

// --- “基本设定”面板方法 ---
const loadBasicSettingsData = async (storeId) => {
  if (!storeId) {
    employees.value = [];
    return;
  }
  loading.value = true;
  try {
    // 查询当前店铺班次定义信息
    await shiftsAndRestTime({ storeId }).then((res) => {
      shifts.value = res.map((item) => ({
        ...item,
        timeRange: [item.startTime, item.endTime],
        breakTimes: item.shiftBreaksList.map((bt) => ({
          id: bt.id,
          range: [bt.breakStartTime, bt.breakEndTime],
        })),
      }));
    });
    console.log('shiftsAndRestTime>%o', shifts.value);
  } catch {
    message.error('加载配置数据失败');
  } finally {
    loading.value = false;
  }
};

const handleAddShift = () => {
  Object.assign(shiftForm, {
    id: undefined,
    name: '',
    code: '',
    timeRange: ['09:00', '18:00'],
    isCrossDay: false,
    color: '#e6f7ff',
    breakTimes: [{ id: Date.now(), range: undefined }],
  });
  isShiftModalVisible.value = true;
};

const handleEditShift = (shift) => {
  // 深拷贝数据以编辑
  const shiftToEdit = JSON.parse(JSON.stringify(shift));
  Object.assign(shiftForm, {
    ...shiftToEdit,
    timeRange: [shiftToEdit.startTime, shiftToEdit.endTime],
  });
  isShiftModalVisible.value = true;
};

const handleShiftOk = () => {
  // MOCK: 此处应调用新增或编辑班次的API
  console.log('Saving shift:', shiftForm);
  message.success('班次保存成功');
  isShiftModalVisible.value = false;
  loadBasicSettingsData(activeStoreId.value); // 重新加载数据
};

const handleDeleteShift = (id: number) => {
  Modal.confirm({
    title: '确认删除此班次吗？',
    content: '删除后，人力需求模型中对应的行也会被移除。',
    onOk: () => {
      // MOCK: 此处应调用删除班次的API
      console.log('Deleting shift:', id);
      message.success('班次删除成功');
      loadBasicSettingsData(activeStoreId.value); // 重新加载数据
    },
  });
};

// --- 班次弹窗内的休息时间方法 ---
const addBreakTime = () => {
  if (!shiftForm.breakTimes) {
    shiftForm.breakTimes = [];
  }
  shiftForm.breakTimes.push({ id: Date.now(), range: undefined });
};

const removeBreakTime = (id: number) => {
  const index = shiftForm.breakTimes.findIndex((item) => item.id === id);
  if (index !== -1) {
    shiftForm.breakTimes.splice(index, 1);
  }
};

// =================================================================================
// 页面核心逻辑
// =================================================================================
const selectedStore = computed(() =>
  allStores.value.find((s) => s.id === activeStoreId.value),
);

const loadWorkbenchData = async (storeId) => {
  if (!storeId) {
    employees.value = [];
    return;
  }
  loading.value = true;
  try {
    // 查询当前店铺的员工与技能信息
    await listUserprofileWithSkills({ storeId }).then((res) => {
      employees.value = res.map((item) => ({
        ...item,
        skills: item.skills.map((skill) => skill.id),
        availableTimes: item.availableTimes.map((time) => ({
          ...time,
          timeRange: [time.startTime, time.endTime],
        })),
      }));
    });
    console.log('employess->%o', employees.value);
    // 模拟需求
    requirements.weekday = [{ shiftId: 1, '1': 2, '2': 3 }]; // skillId: count
    requirements.holiday = [{ shiftId: 1, '1': 3, '2': 5 }];
  } catch {
    message.error('加载配置数据失败');
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  const data = await storesList();
  allStores.value = data.rows;

  // TODO 1: 默认选中第一个店铺
  if (userRole.value === 'admin' && allStores.value.length > 0) {
    activeStoreId.value = allStores.value[0].id;
  } else if (userRole.value === 'store') {
    activeStoreId.value = loggedInStoreId;
  }

  if (activeStoreId.value) {
    const data = await skillsList({ storeId: activeStoreId.value });
    allSkills.value = data.rows;
    await loadWorkbenchData(activeStoreId.value);
    await loadPermissionsData(activeStoreId.value);
    await loadRulesData(activeStoreId.value);
    await loadBasicSettingsData(activeStoreId.value);
  } else {
    loading.value = false;
  }
});

watch(activeStoreId, (newId) => {
  if (newId) {
    loadWorkbenchData(newId);
    loadPermissionsData(newId);
    loadRulesData(newId);
    loadBasicSettingsData(newId);
  }
});

// --- 员工属性交互 ---
const handleEditEmployee = (employee) => {
  currentEditingEmployee.value = employee;
  nextTick(() => {
    isEmployeeModalVisible.value = true;
  });
};

const handleEmployeeUpdate = () => {
  // 提交成功后，重新加载数据
  loadWorkbenchData(activeStoreId.value);
};

// --- 其他交互方法 (保持不变) ---
const handleStoreSelect = (storeId: number) => {
  activeStoreId.value = storeId;
};

// =================================================================================
// 工具函数
// =================================================================================
const getSkillNames = (skillIds) => {
  return skillIds
    .map((id) => allSkills.value.find((s) => s.id === id)?.name || '未知')
    .join(', ');
};

const formatAvailableTimes = (times: Availability[]) => {
  if (!times || times.length === 0) return '未设置';

  const timeGroup = times.reduce(
    (acc, t) => {
      const timeRange = `${t.startTime}-${t.endTime}`;
      if (!acc[timeRange]) {
        acc[timeRange] = [];
      }
      acc[timeRange].push(weekDayMap[t.dayOfWeek]);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  return Object.entries(timeGroup)
    .map(([timeRange, days]) => `${days.join('/')} ${timeRange}`)
    .join('; ');
};

const formatSupportStores = (storeIds) => {
  if (!storeIds || storeIds.length === 0) return '-';
  return storeIds
    .map((id) => allStores.value.find((s) => s.id === id)?.name || '未知')
    .join(', ');
};
</script>

<template>
  <div class="workbench-container">
    <div class="store-selection-header">
      <h1 class="page-title"><ShopOutlined /> 排班配置工作台</h1>
      <div v-if="userRole === 'admin'">
        <p>请选择您要管理的店铺：</p>
        <div class="store-card-list">
          <div
            v-for="store in allStores"
            :key="store.id"
            class="store-card"
            :class="{ active: store.id === activeStoreId }"
            @click="handleStoreSelect(store.id)"
          >
            <div class="store-card-name">{{ store.name }}</div>
            <div class="store-card-id">ID: {{ store.id }}</div>
          </div>
        </div>
      </div>
      <div v-else>
        <a-alert
          :message="`您正在管理店铺：${selectedStore?.name}`"
          type="success"
          show-icon
        />
      </div>
    </div>

    <a-spin :spinning="loading">
      <div v-if="activeStoreId" class="config-main">
        <!-- 权限与高级设定 -->
        <a-card class="config-panel">
          <template #title>
            <div class="panel-title">
              <SafetyCertificateOutlined /> 权限与高级设定
            </div>
          </template>
          <template #extra v-if="userRole === 'admin' && activeStoreId">
            <a-button type="primary" @click="openCopySettingsModal">
              <CopyOutlined /> 复制店铺设定
            </a-button>
          </template>
          <a-tabs>
            <a-tab-pane key="1" tab="帐号权限管理">
              <a-button type="dashed" @click="handleAddUserAuth" class="mb-4">
                <PlusOutlined /> 添加授权人员
              </a-button>
              <a-table
                :data-source="authorizedUsers"
                :columns="[
                  { title: '姓名', dataIndex: 'name' },
                  { title: '职位', dataIndex: 'position' },
                  { title: '操作', key: 'action' },
                ]"
                size="small"
                :pagination="false"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'action'">
                    <a-button
                      type="link"
                      danger
                      size="small"
                      @click="handleRemoveUserAuth(record.id)"
                    >
                      移除权限
                    </a-button>
                  </template>
                </template>
              </a-table>
            </a-tab-pane>
            <a-tab-pane key="2" tab="跨店支援设定">
              <p>
                请选择
                <strong>{{ selectedStore?.name }}</strong>
                可以支援或被其支援的店铺。
              </p>
              <a-transfer
                v-model:target-keys="supportTargetKeys"
                :data-source="
                  allStores
                    .filter((s) => s.id !== activeStoreId)
                    .map((s) => ({ key: s.id, title: s.name }))
                "
                :titles="['其他店铺', '可互相支援']"
                :render="(item) => item.title"
                @change="handleSupportChange"
              />
              <a-button
                type="primary"
                class="mt-4"
                @click="handleSaveSupportSettings"
              >
                保存支援设定
              </a-button>
            </a-tab-pane>
          </a-tabs>
        </a-card>
        <!-- 基本设定 -->
        <a-card class="config-panel">
          <template #title>
            <div class="panel-title"><GoldOutlined /> 基本设定</div>
          </template>
          <a-row :gutter="[16, 16]">
            <a-col :md="12" :xs="24">
              <a-list bordered>
                <template #header>
                  <div class="list-header">
                    <span>班别设定</span>
                    <a-button
                      type="dashed"
                      size="small"
                      @click="handleAddShift"
                    >
                      <PlusOutlined /> 新增班别
                    </a-button>
                  </div>
                </template>
                <a-list-item v-for="shift in shifts" :key="shift.id">
                  <a-list-item-meta>
                    <template #title>
                      <a-space>
                        <div
                          :style="{
                            width: '12px',
                            height: '12px',
                            background: shift.colorCode,
                            borderRadius: '3px',
                          }"
                        ></div>
                        <span>{{ shift.name }} ({{ shift.code }})</span>
                        <a-tag v-if="shift.isCrossDay === 1" color="purple">
                          跨日
                        </a-tag>
                      </a-space>
                    </template>
                    <template #description>
                      <span
                        >班次时段: {{ shift.startTime }} -
                        {{ shift.endTime }}</span
                      >
                      <span
                        v-if="shift.breakTimes && shift.breakTimes.length > 0"
                        style="margin-left: 16px"
                      >
                        休息:
                        {{
                          shift.breakTimes
                            .map((b) => `${b.range[0]}-${b.range[1]}`)
                            .join(', ')
                        }}
                      </span>
                    </template>
                  </a-list-item-meta>
                  <template #actions>
                    <a-button
                      type="link"
                      size="small"
                      @click="handleEditShift(shift)"
                    >
                      <EditOutlined />
                    </a-button>
                    <a-button
                      type="link"
                      size="small"
                      danger
                      @click="handleDeleteShift(shift.id)"
                    >
                      <DeleteOutlined />
                    </a-button>
                  </template>
                </a-list-item>
              </a-list>
            </a-col>
            <a-col :md="12" :xs="24">
              <a-list bordered header="其他基础设定">
                <a-list-item>
                  <a-list-item-meta
                    title="跨日工时归属规则"
                    description="跨日班次的工时归属于哪一天进行计算"
                  />
                  <a-radio-group
                    v-model:value="basicSettings.crossDayRule"
                    button-style="solid"
                  >
                    <a-radio-button value="by_shift_start">
                      依照班别开始日
                    </a-radio-button>
                    <a-radio-button value="by_calendar_day">
                      依照日历天
                    </a-radio-button>
                  </a-radio-group>
                </a-list-item>
                <a-list-item>
                  <a-list-item-meta
                    title="员工分类"
                    description="系统内定义的员工类型"
                  />
                  <div>
                    <a-tag
                      v-for="t in basicSettings.employeeTypes"
                      :key="t"
                      color="green"
                    >
                      {{ t }}
                    </a-tag>
                  </div>
                </a-list-item>
              </a-list>
            </a-col>
          </a-row>
        </a-card>
        <!-- 员工属性配置 -->
        <a-card class="config-panel">
          <template #title>
            <div class="panel-title"><TeamOutlined /> 员工属性配置</div>
          </template>
          <a-table :data-source="employees" :pagination="false" size="small">
            <a-table-column
              title="员工姓名"
              data-index="userName"
              key="userName"
            />
            <a-table-column
              title="职位"
              data-index="employeeType"
              key="employeeType"
            >
              <template #default="{ text }">
                <a-tag :color="text === '正职' ? 'blue' : 'orange'">
                  {{ text }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="技能" data-index="skills" key="skills">
              <template #default="{ text }">
                <span v-if="text.length === 0">-</span>
                <a-tag v-for="skillId in text" :key="skillId" color="geekblue">
                  {{ allSkills.find((s) => s.id === skillId)?.name }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column
              title="优先分数"
              data-index="priorityScore"
              key="priorityScore"
              align="center"
            />
            <a-table-column
              title="可上班时间"
              data-index="availableTimes"
              key="availableTimes"
            >
              <template #default="{ text: availableTimes }">
                <a-tooltip v-if="availableTimes && availableTimes.length > 0">
                  <template #title>
                    <div
                      v-for="item in (availableTimes as Availability[])"
                      :key="item.id"
                    >
                      {{ weekDayMap[item.dayOfWeek] }}: {{ item.startTime }} -
                      {{ item.endTime }}
                    </div>
                  </template>
                  <span>{{ formatAvailableTimes(availableTimes) }}</span>
                </a-tooltip>
                <span v-else>未设置</span>
              </template>
            </a-table-column>
            <a-table-column
              title="支援外店"
              data-index="supportStoreIds"
              key="supportStoreIds"
            >
              <template #default="{ text }">
                <span>{{ formatSupportStores(text) }}</span>
              </template>
            </a-table-column>
            <a-table-column title="操作" key="action">
              <template #default="{ record }">
                <a-button type="link" @click="handleEditEmployee(record)">
                  编辑
                </a-button>
              </template>
            </a-table-column>
          </a-table>
        </a-card>
        <!-- 每日人力需求 -->
        <a-card class="config-panel">
          <template #title>
            <div class="panel-title"><BarChartOutlined /> 每日人力需求</div>
          </template>
          <a-tabs>
            <a-tab-pane key="weekday" tab="平日需求">
              <a-table
                :columns="requirementColumns"
                :data-source="shifts"
                :pagination="false"
                bordered
                size="small"
                row-key="id"
                :scroll="{ x: 800 }"
              >
                <template #bodyCell="{ column, record: shift }">
                  <template v-if="column.key !== 'name'">
                    <a-input-number
                      :value="
                        getRequirementCount('weekday', shift.id, column.key)
                      "
                      @update:value="
                        (val) =>
                          setRequirementCount(
                            'weekday',
                            shift.id,
                            column.key,
                            val,
                          )
                      "
                      :min="0"
                      style="width: 100%"
                    />
                  </template>
                </template>
              </a-table>
              <a-button
                type="primary"
                class="mt-4"
                @click="handleSaveRequirements('weekday')"
              >
                保存平日需求
              </a-button>
            </a-tab-pane>
            <a-tab-pane key="holiday" tab="假日需求">
              <a-table
                :columns="requirementColumns"
                :data-source="shifts"
                :pagination="false"
                bordered
                size="small"
                row-key="id"
                :scroll="{ x: 800 }"
              >
                <template #bodyCell="{ column, record: shift }">
                  <template v-if="column.key !== 'name'">
                    <a-input-number
                      :value="
                        getRequirementCount('holiday', shift.id, column.key)
                      "
                      @update:value="
                        (val) =>
                          setRequirementCount(
                            'holiday',
                            shift.id,
                            column.key,
                            val,
                          )
                      "
                      :min="0"
                      style="width: 100%"
                    />
                  </template>
                </template>
              </a-table>
              <a-button
                type="primary"
                class="mt-4"
                @click="handleSaveRequirements('holiday')"
              >
                保存假日需求
              </a-button>
            </a-tab-pane>
            <a-tab-pane key="special" tab="特殊节日需求">
              <a-button type="dashed" @click="handleAddSpecialDay" class="mb-4">
                <PlusOutlined /> 添加特殊日
              </a-button>
              <a-list :data-source="requirements.special" bordered size="small">
                <a-list-item
                  v-for="day in requirements.special"
                  :key="day.date"
                >
                  <a-list-item-meta
                    :title="day.name"
                    :description="`日期：${day.date}`"
                  />
                  <template #actions>
                    <a-button type="link" @click="handleEditSpecialDay(day)">
                      编辑需求
                    </a-button>
                  </template>
                </a-list-item>
              </a-list>
            </a-tab-pane>
          </a-tabs>
        </a-card>
        <!-- 休假与上班时数规则 -->
        <a-row :gutter="16">
          <a-col :md="12" :xs="24">
            <a-card class="config-panel">
              <template #title>
                <div class="panel-title"><CoffeeOutlined /> 休假规则设定</div>
              </template>
              <a-form :model="rulesSettings.leaveRules" layout="vertical">
                <a-form-item label="员工预填期望休假">
                  <a-switch
                    v-model:checked="rulesSettings.leaveRules.allowLeaveRequest"
                  />
                  <p class="setting-description">
                    开启后，员工可在排班发布前，于员工端提交期望的休假日期。
                  </p>
                </a-form-item>
                <a-form-item label="排班发布后锁定休假申请">
                  <a-switch
                    v-model:checked="rulesSettings.leaveRules.lockAfterPublish"
                  />
                  <p class="setting-description">
                    开启后，一旦周度排班被发布，员工将不能再提交期望休假。
                  </p>
                </a-form-item>
                <a-form-item label="全职员工同时排休规则">
                  <a-input-number
                    v-model:value="rulesSettings.leaveRules.maxFullTimeLeave"
                    :min="1"
                    addon-after="人"
                  />
                  <p class="setting-description">
                    设置每日最多允许同时休假的全职员工数量。若申请人数超过此限制，系统将自动抽签并通知。
                  </p>
                </a-form-item>
                <a-form-item label="开放员工自选排休 (开发中)">
                  <a-switch
                    v-model:checked="
                      rulesSettings.leaveRules.allowRestSelection
                    "
                    disabled
                  />
                  <p class="setting-description">
                    开启后，员工可自行勾选周一至周日的期望休息日。
                  </p>
                </a-form-item>
              </a-form>
            </a-card>
          </a-col>
          <a-col :md="12" :xs="24">
            <a-card class="config-panel">
              <template #title>
                <div class="panel-title">
                  <HourglassOutlined /> 上班时数规则
                </div>
              </template>
              <a-tabs>
                <a-tab-pane key="fullTime" tab="全职">
                  <a-form
                    :model="rulesSettings.workingHoursRules.fullTime"
                    layout="vertical"
                  >
                    <a-form-item label="固定每月休息日数">
                      <a-input-number
                        v-model:value="
                          rulesSettings.workingHoursRules.fullTime
                            .monthlyRestDays
                        "
                        :min="0"
                        addon-after="日"
                      />
                    </a-form-item>
                  </a-form>
                </a-tab-pane>
                <a-tab-pane key="partTime" tab="兼职">
                  <a-form
                    :model="rulesSettings.workingHoursRules.partTime"
                    layout="vertical"
                  >
                    <a-form-item label="弹性月休最少日数">
                      <a-input-number
                        v-model:value="
                          rulesSettings.workingHoursRules.partTime
                            .minMonthlyRestDays
                        "
                        :min="0"
                        addon-after="日"
                      />
                    </a-form-item>
                    <a-form-item label="每周工时上限">
                      <a-input-number
                        v-model:value="
                          rulesSettings.workingHoursRules.partTime
                            .maxWeeklyHours
                        "
                        :min="0"
                        addon-after="小时"
                      />
                    </a-form-item>
                  </a-form>
                </a-tab-pane>
                <a-tab-pane key="general" tab="通用规则">
                  <a-form
                    :model="rulesSettings.workingHoursRules.general"
                    layout="vertical"
                  >
                    <a-form-item label="每周最多上班天数">
                      <a-input-number
                        v-model:value="
                          rulesSettings.workingHoursRules.general
                            .maxWeeklyWorkDays
                        "
                        :min="1"
                        :max="7"
                        addon-after="日"
                      />
                    </a-form-item>
                    <a-form-item label="可连续最多上班天数">
                      <a-input-number
                        v-model:value="
                          rulesSettings.workingHoursRules.general
                            .maxConsecutiveWorkDays
                        "
                        :min="1"
                        addon-after="日"
                      />
                    </a-form-item>
                  </a-form>
                </a-tab-pane>
              </a-tabs>
            </a-card>
          </a-col>
        </a-row>

        <div class="save-button-container">
          <a-button type="primary" size="large" @click="handleSaveRules">
            保存所有规则设定
          </a-button>
        </div>
      </div>
      <a-empty
        v-else
        description="请从上方店铺卡片中选择一个店铺以开始配置"
        style="margin-top: 50px"
      />
    </a-spin>

    <EmployeeEditModal
      v-if="currentEditingEmployee"
      v-model:visible="isEmployeeModalVisible"
      :employee-data="currentEditingEmployee"
      :all-skills="allSkills"
      :all-stores="allStores"
      @submit="handleEmployeeUpdate"
    />

    <a-modal v-model:visible="isUserAuthModalVisible" title="添加授权人员">
      <p>
        请选择要授予 <strong>{{ selectedStore?.name }}</strong> 访问权限的人员。
      </p>
      <a-transfer
        :data-source="mockAllSystemUsers"
        :titles="['系统人员', '已授权']"
        :render="(item) => item.title"
      />
      <template #footer>
        <a-button @click="isUserAuthModalVisible = false">取消</a-button>
        <a-button type="primary" @click="handleUserAuthOk([2001, 3001])">
          确认添加
        </a-button>
      </template>
    </a-modal>

    <a-modal
      v-model:visible="isCopySettingsModalVisible"
      title="一键复制店铺设定"
      @ok="handleCopySettings"
    >
      <a-form layout="vertical">
        <a-form-item label="源店铺">
          <a-input :value="selectedStore?.name" disabled />
        </a-form-item>
        <a-form-item label="目标店铺 (可多选)">
          <a-select
            v-model:value="copySettingsForm.targetStoreIds"
            mode="multiple"
            placeholder="请选择要同步的店铺"
          >
            <a-select-option
              v-for="store in allStores.filter((s) => s.id !== activeStoreId)"
              :key="store.id"
              :value="store.id"
            >
              {{ store.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="选择要复制的项目">
          <a-checkbox-group
            v-model:value="copySettingsForm.copyItems"
            style="display: block"
          >
            <a-row>
              <a-col :span="12">
                <a-checkbox value="shifts">班次设定</a-checkbox>
              </a-col>
              <a-col :span="12">
                <a-checkbox value="requirements"> 人力需求模型 </a-checkbox>
              </a-col>
              <a-col :span="12">
                <a-checkbox value="rules">休假与工时规则</a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:visible="isSpecialDayModalVisible"
      title="配置特殊日需求"
      width="800px"
      @ok="handleSpecialDayOk"
    >
      <a-form :model="specialDayForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="特殊日期">
              <a-date-picker
                v-model:value="specialDayForm.date"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="名称 (如: 国庆节)">
              <a-input v-model:value="specialDayForm.name" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <p>请为该特殊日配置人力需求：</p>
      <a-table
        :columns="requirementColumns"
        :data-source="shifts"
        :pagination="false"
        bordered
        size="small"
        row-key="id"
        :scroll="{ x: 800 }"
      >
        <template #bodyCell="{ column, record: shift }">
          <template v-if="column.key !== 'name'">
            <a-input-number
              :value="
                getRequirementCount(
                  'special',
                  shift.id,
                  column.key,
                  specialDayForm,
                )
              "
              @update:value="
                (val) =>
                  setRequirementCount(
                    'special',
                    shift.id,
                    column.key,
                    val,
                    specialDayForm,
                  )
              "
              :min="0"
              style="width: 100%"
            />
          </template>
        </template>
      </a-table>
    </a-modal>

    <!-- 基本设定 Modal-->
    <a-modal
      v-model:visible="isShiftModalVisible"
      :title="shiftForm.id ? '编辑班次' : '新增班次'"
      @ok="handleShiftOk"
      width="600px"
    >
      <a-form :model="shiftForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="班次名称">
              <a-input v-model:value="shiftForm.name" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="班次代码">
              <a-input v-model:value="shiftForm.code" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="时间范围">
              <a-time-range-picker
                v-model:value="shiftForm.timeRange"
                format="HH:mm"
                value-format="HH:mm"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="显示颜色">
              <input
                type="color"
                v-model="shiftForm.color"
                style="width: 100%; height: 32px"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item>
          <a-checkbox v-model:checked="shiftForm.isCrossDay">
            是否跨日班别
          </a-checkbox>
        </a-form-item>
        <a-divider />
        <a-form-item label="休息时间设定 (可设定多段)">
          <div
            v-for="item in shiftForm.breakTimes"
            :key="item.id"
            class="break-time-row"
          >
            <a-time-range-picker
              v-model:value="item.range"
              format="HH:mm"
              value-format="HH:mm"
            />
            <a-button
              type="text"
              danger
              @click="removeBreakTime(item.id)"
              v-if="shiftForm.breakTimes.length > 1"
            >
              <template #icon><DeleteOutlined /></template>
            </a-button>
          </div>
          <a-button type="dashed" block @click="addBreakTime">
            <PlusOutlined /> 添加休息时段
          </a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style lang="less" scoped>
/* 样式与之前版本保持一致 */
.workbench-container {
  padding: 16px;
  background-color: #f0f2f5;
}
.store-selection-header {
  background: #fff;
  padding: 16px 24px;
  border-radius: 8px;
  margin-bottom: 16px;
}
.page-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.store-card-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
}
.store-card {
  padding: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  width: 180px;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
    border-color: #40a9ff;
  }

  &.active {
    background: #e6f7ff;
    border-color: #1890ff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}
.store-card-name {
  font-size: 16px;
  font-weight: 500;
}
.store-card-id {
  font-size: 12px;
  color: #888;
}
.config-panel {
  margin-bottom: 16px;
}
.panel-title {
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}
.mt-4 {
  margin-top: 16px;
}
.mb-4 {
  margin-bottom: 16px;
}
</style>
