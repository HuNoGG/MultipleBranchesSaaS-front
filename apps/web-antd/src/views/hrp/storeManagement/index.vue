<script setup lang="ts">
import type { FormInstance, TableColumnType } from 'ant-design-vue'; // 新增 FormInstance

import type { SkillsVO } from '../skills/model';
import type { Employee, Skill, Store } from './mock-data';

import type { User } from '#/api/system/user/model';

import { computed, onMounted, reactive, ref, watch } from 'vue'; // 新增 reactive 和 nextTick
import { h } from 'vue';

import {
  ArrowLeftOutlined,
  BarChartOutlined,
  CoffeeOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons-vue';
import { message, Modal, Tag } from 'ant-design-vue';

import { weekDayMap } from '#/api/common.d.ts';
import {
  saveDailyRequirements,
  scheduleRequirementsAllTypeList,
} from '#/api/hrp/scheduleRequirements';
import { saveBasicSettings, shiftsAndRestTime } from '#/api/hrp/shifts';
import {skillsAdd, skillsList, skillsRemove, skillsUpdate} from '#/api/hrp/skills';
import { storesAdd, storesList, storesUpdate } from '#/api/hrp/stores';
import { listUserprofileWithSkills } from '#/api/hrp/userProfile';

import EmployeeEditModal from './EmployeeEditModal.vue';
// MOCK: 引入独立的 MOCK 数据文件
import { getMockUnassignedUsers } from './mock-data';

// ========== 视图控制 ==========
type ViewType = 'details' | 'list';
const currentView = ref<ViewType>('list');
const loading = ref(false);

// ========== 店铺列表视图状态 ==========
const storeList = ref<Store[]>([]);
const storeListColumns: TableColumnType[] = [
  { title: '店铺名称', dataIndex: 'name', key: 'name' },
  { title: '店铺地址', dataIndex: 'address', key: 'address' },
  // { title: '店长', dataIndex: 'managerName', key: 'managerName', width: 100 },
  {
    title: '联系电话',
    dataIndex: 'contact',
    key: 'contact',
    width: 150,
  },
  {
    title: '员工数',
    dataIndex: 'employeeCount',
    key: 'employeeCount',
    width: 100,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    customRender: ({ text }) => {
      if (text) {
        // 兼容 '0' 和 '营业中' 两种可能的值
        const isOperating = text === '0' || text === '营业中';
        const color = isOperating ? 'processing' : 'red';
        const statusText = isOperating ? '营业中' : '已关闭';

        return h(Tag, { color }, () => statusText);
      }
      return '-'; // 如果没有状态值, 返回横杠
    },
  },
  { title: '操作', key: 'action', width: 150 },
];

// ========== 店铺详情视图状态 ==========
const selectedStore = ref<null | Store>(null);
const activeTab = ref('personnel');

// 页签数据
const personnelList = ref<Employee[]>([]);
const skillList = ref<SkillsVO[]>([]);
const personnelListLoading = ref(false);
const skillListLoading = ref(false);

const shifts = ref<any[]>([]);
const requirements = ref<{
  holiday: any[];
  special: any[];
  weekday: any[];
}>({
  weekday: [],
  holiday: [],
  special: [],
});
const requirementDayType = ref('weekday');
const shiftListLoading = ref(false);
const requirementLoading = ref(false);

// 动态生成排班规则表格的列
const requirementColumns = computed(() => {
  const baseColumns: TableColumnType[] = [
    {
      title: '班次',
      dataIndex: 'shiftName',
      key: 'shiftName',
      width: 150,
      fixed: 'left',
    },
  ];
  const skillColumns = skillList.value.map((skill) => ({
    title: skill.name,
    dataIndex: skill.name,
    key: skill.id,
    width: 100,
  }));
  return [...baseColumns, ...skillColumns];
});

const personnelColumns: TableColumnType[] = [
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '工号', dataIndex: 'employeeId', key: 'employeeId' },
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '入职日期', dataIndex: 'hireDate', key: 'hireDate' },
  { title: '拥有技能', dataIndex: 'skills', key: 'skills' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '操作', key: 'action', width: 120 },
];

const skillColumns: TableColumnType[] = [
  { title: '技能名称', dataIndex: 'name', key: 'name' },
  { title: '技能描述', dataIndex: 'description', key: 'description' },
  { title: '操作', key: 'action', width: 120 },
];

// ========== TODO: 新增 - 弹窗与表单状态管理 ==========
const isStoreModalVisible = ref(false);
const isEmployeeModalVisible = ref(false);
const isSkillModalVisible = ref(false);
const isAddEmployeeModalVisible = ref(false);
const isShiftModalVisible = ref(false); // 班次弹窗状态

const storeFormRef = ref<FormInstance>();
const skillFormRef = ref<FormInstance>();
const shiftFormRef = ref<FormInstance>();

const modalTitle = ref('');

// 表单数据
const storeForm = reactive<Partial<Store>>({});
let employeeForm = reactive<Partial<Employee>>({});
const skillForm = reactive<Partial<Skill>>({});
const shiftForm = reactive<any>({ breakTimes: [] });

// 新增人员弹窗所需数据
const unassignedUsers = ref<User[]>([]); //  存储未分配的用户
const selectedUserKeysForAdd = ref<string[]>([]); //  存储选中的用户ID
const addEmployeeLoading = ref(false); //  新增人员弹窗的加载状态

// 表单验证规则
const storeRules = {
  name: [{ required: true, message: '请输入店铺名称' }],
  address: [{ required: true, message: '请输入店铺地址' }],
  managerName: [{ required: true, message: '请输入店长姓名' }],
  contact: [{ required: true, message: '请输入联系电话' }],
};

const skillRules = {
  name: [{ required: true, message: '请输入技能名称' }],
};

// ========== 方法 ==========

// --- 数据加载 ---
const loadStoreList = async () => {
  loading.value = true;
  try {
    // TODO: 调用获取店铺列表的API
    await storesList().then((res) => {
      storeList.value = res.rows;
    });
  } catch {
    message.error('加载店铺列表失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadStoreList();
});

// --- 视图切换 ---
const goToDetails = async (store: Store) => {
  selectedStore.value = store;
  currentView.value = 'details';
  await loadPersonnelList();
};

const goBackToList = () => {
  selectedStore.value = null;
  currentView.value = 'list';
  activeTab.value = 'personnel';
};

// --- 页签数据加载 ---
const loadPersonnelList = async () => {
  if (!selectedStore.value) return;
  personnelListLoading.value = true;
  try {
    // TODO: 调用根据 storeId 获取员工列表的API
    // 查询当前店铺的员工与技能信息

    await listUserprofileWithSkills({ storeId: selectedStore.value.id }).then(
      (res) => {
        personnelList.value = res.map((item) => ({
          ...item,
          skillList: item.skills.map((skill) => skill.id),
          availableTimes: item.availableTimes.map((time) => ({
            ...time,
            timeRange: [time.startTime, time.endTime],
          })),
        }));
      },
    );
  } catch {
    message.error('加载人员列表失败');
  } finally {
    personnelListLoading.value = false;
  }
};

const loadSkillList = async () => {
  if (!selectedStore.value) return;
  skillListLoading.value = true;
  try {
    const data = await skillsList({ storeId: selectedStore.value.id });
    skillList.value = data.rows;
  } catch {
    message.error('加载技能列表失败');
  } finally {
    skillListLoading.value = false;
  }
};

const loadShiftsAndRequirements = async () => {
  if (!selectedStore.value) return;
  shiftListLoading.value = true;
  requirementLoading.value = true;
  const storeId = selectedStore.value.id;
  try {
    // 1. 并行获取班次和已保存的需求规则
    const [shiftsRes, reqRes] = await Promise.all([
      shiftsAndRestTime({ storeId }),
      scheduleRequirementsAllTypeList({ storeId }),
    ]);

    // 2. 处理班次数据
    shifts.value = shiftsRes.map((item: any) => ({
      ...item,
      timeRange: [item.startTime, item.endTime],
      breakTimes: item.shiftBreaksList.map((bt: any) => ({
        id: bt.id,
        range: [bt.breakStartTime, bt.breakEndTime],
      })),
    }));

    // 3. 动态构建一个完整、空的排班需求结构
    //    这样做可以确保即使新增了班次或技能, 表格也能正确显示
    const newRequirements = { weekday: [], holiday: [], special: [] };
    const dayTypes = ['weekday', 'holiday', 'special'];
    const dayTypeMap = {
      weekday: '平日',
      holiday: '假日',
      special: '特殊节假日',
    };

    dayTypes.forEach((dayType) => {
      shifts.value.forEach((shift) => {
        const reqRow = {
          shiftId: shift.id,
          shiftName: shift.name,
          dayType: dayTypeMap[dayType],
        };
        // 动态地为该班次行添加所有技能, 并将初始需求数量设为0
        skillList.value.forEach((skill) => {
          reqRow[skill.name] = 0;
        });
        newRequirements[dayType].push(reqRow);
      });
    });

    // 4. 将从API获取的真实需求数据, 填充到上面构建好的结构中
    const reqDataFromApi = reqRes; // 这是 { weekday: [...], holiday: [...], ... }
    if (reqDataFromApi) {
      for (const dayTypeKey in reqDataFromApi) {
        // 遍历 weekday, holiday, special
        const reqsForType = reqDataFromApi[dayTypeKey];
        if (reqsForType && newRequirements[dayTypeKey]) {
          reqsForType.forEach((req) => {
            const targetRow = newRequirements[dayTypeKey].find(
              (row) => row.shiftId === req.shiftId,
            );
            const skill = skillList.value.find((s) => s.id === req.skillId);
            // 确保班次和技能都存在, 才进行赋值
            if (targetRow && skill) {
              targetRow[skill.name] = req.requiredCount;
            }
          });
        }
      }
    }

    requirements.value = newRequirements;
  } catch {
    message.error('加载班次与需求配置失败');
  } finally {
    shiftListLoading.value = false;
    requirementLoading.value = false;
  }
};

watch(activeTab, (newTab) => {
  // 初次加载加载全部

  if (
    personnelList.value.length === 0 ||
    skillList.value.length === 0 ||
    shifts.value.length === 0
  ) {
    loadSkillList();
    loadPersonnelList();
    loadShiftsAndRequirements();
  }
  if (newTab === 'personnel' && personnelList.value.length > 0) {
    loadPersonnelList();
  }
  if (newTab === 'skills' && skillList.value.length > 0) {
    loadSkillList();
  }
  if ((newTab === 'shifts' || newTab === 'rules') && shifts.value.length > 0) {
    loadShiftsAndRequirements();
  }
});

// --- TODO: 更新 - CRUD 操作 ---
const handleAddStore = () => {
  Object.keys(storeForm).forEach((key) => delete storeForm[key]); // 清空对象
  modalTitle.value = '新增店铺';
  isStoreModalVisible.value = true;
};

//  新增 - 打开新增人员弹窗
const handleAddEmployee = async () => {
  isAddEmployeeModalVisible.value = true;
  addEmployeeLoading.value = true;
  try {
    // TODO: 调用API获取未分配的系统用户
    // const res = await getUnassignedUsersApi();
    // unassignedUsers.value = res.data;
    unassignedUsers.value = getMockUnassignedUsers();
    selectedUserKeysForAdd.value = []; // 清空上次选择
  } catch {
    message.error('获取未分配员工列表失败');
  } finally {
    addEmployeeLoading.value = false;
  }
};

const handleEditEmployee = (employee: Employee) => {
  // 深拷贝
  employeeForm = employee;

  modalTitle.value = `编辑员工 - ${employee.userName}`;
  isEmployeeModalVisible.value = true;
};

const handleAddSkill = () => {
  Object.keys(skillForm).forEach((key) => delete skillForm[key]);
  modalTitle.value = '新增技能';
  isSkillModalVisible.value = true;
};

const handleEditSkill = (skill: Skill) => {
  Object.keys(skillForm).forEach((key) => delete skillForm[key]);
  // 深拷贝
  Object.assign(skillForm, JSON.parse(JSON.stringify(skill)));
  modalTitle.value = `编辑技能 - ${skill.name}`;
  isSkillModalVisible.value = true;
};

const handleDeleteSkill = (skill: Skill) => {
  Modal.confirm({
    title: `确认删除技能 "${skill.name}"?`,
    content: '删除后, 员工已关联的此技能也会被移除。',
    onOk: () => {
      skillsRemove(skill.id);
      message.success(`技能 "${skill.name}" 已删除`);
      loadSkillList();
    },
  });
};

const handleAddShift = () => {
  Object.assign(shiftForm, {
    id: null,
    name: '',
    code: '',
    colorCode: '#1677ff',
    timeRange: [],
    breakTimes: [],
    isCrossDay: 0,
  });
  modalTitle.value = '新增班次';
  isShiftModalVisible.value = true;
};

const handleEditShift = (shift: any) => {
  Object.assign(shiftForm, JSON.parse(JSON.stringify(shift)));
  modalTitle.value = `编辑班次 - ${shift.name}`;
  isShiftModalVisible.value = true;
};

const handleDeleteShift = (shift: any) => {
  Modal.confirm({
    title: `确认删除班次 "${shift.name}"?`,
    content: '删除后将无法恢复, 且关联的排班规则也会被清除。',
    onOk: async () => {
      // TODO: 调用删除班次的API
      // await shiftsRemove({ id: shift.id });
      message.success('班次删除成功');
      await loadShiftsAndRequirements();
    },
  });
};

const addBreakTime = () => {
  shiftForm.breakTimes.push({ id: Date.now(), range: [] });
};

const removeBreakTime = (index: number) => {
  shiftForm.breakTimes.splice(index, 1);
};

// --- TODO: 新增 - 表单提交方法 ---
const handleStoreSubmit = async () => {
  try {
    await storeFormRef.value?.validate();
    loading.value = true;
    storeForm.crossDayRule = 'by_shift_start';
    await (storeForm.id ? storesUpdate(storeForm) : storesAdd(storeForm));
    message.success(`${modalTitle.value}成功`);
    isStoreModalVisible.value = false;
    await loadStoreList();
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleEmployeeSubmit = async () => {
  try {
    message.success(`员工 ${employeeForm.userName} 信息更新成功`);
    // 保存人员信息
    await loadPersonnelList();
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleSkillSubmit = async () => {
  try {
    await skillFormRef.value?.validate();
    loading.value = true;
    // TODO: 调用新增/编辑技能的API
    // 判断form中是否存在id,存在则走编辑
    await (skillForm.id
      ? skillsUpdate({ ...skillForm, storeId: selectedStore.value.id })
      : skillsAdd({ ...skillForm, storeId: selectedStore.value.id }));
    message.success(`${modalTitle.value}成功`);
    isSkillModalVisible.value = false;
    await loadSkillList();
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleAddEmployeeSubmit = async () => {
  if (selectedUserKeysForAdd.value.length === 0) {
    message.warn('请至少选择一名员工进行添加');
    return;
  }
  loading.value = true; // 使用页面主loading
  try {
    // TODO: 调用API将选择的用户ID和当前店铺ID关联
    // await assignUsersToStoreApi({ storeId: selectedStore.value.id, userIds: selectedUserKeysForAdd.value });
    message.success('员工添加成功');
    isAddEmployeeModalVisible.value = false;
    await loadPersonnelList(); // 刷新人员列表
  } catch {
    message.error('添加员工失败');
  } finally {
    loading.value = false;
  }
};

const handleShiftModalOk = async () => {
  try {
    await shiftFormRef.value?.validate();
    loading.value = true;
    const params = {
      ...shiftForm,
      storeId: selectedStore.value?.id,
      startTime: shiftForm.timeRange[0],
      endTime: shiftForm.timeRange[1],
      breakTimes: shiftForm.breakTimes
        .filter((bt) => bt.range && bt.range.length === 2) // 过滤掉未设置时间的休息
        .map((bt) => ({
          id: bt.id > 1_000_000 ? null : bt.id, // 新增的休息时间ID为null
          range: bt.range,
        })),
    };

    // 3. 构建完整的 BasicSettingsDto
    const finalPayload = {
      storeId: selectedStore.value?.id,
      crossDayRule: 'by_shift_start',
      shifts: [params], // 即使是单个，后台也期望一个列表
    };
    await saveBasicSettings(finalPayload);
    message.success('班次保存成功');
    isShiftModalVisible.value = false;
    await loadShiftsAndRequirements();
  } catch (error) {
    console.error('班次保存失败', error);
  } finally {
    loading.value = false;
  }
};

const formatAvailableTimes = (times: any[]) => {
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

const handleSaveRequirements = async () => {
  if (!selectedStore.value) return;
  requirementLoading.value = true;
  const storeId = selectedStore.value.id;

  try {
    // 使用 Promise.all 并行保存三种类型的需求, 提高效率
    await Promise.all(
      Object.keys(requirements.value).map((type) => {
        // 1. 从表格数据中提取出API所需的格式
        const requirementsList: {
          requiredCount: any;
          shiftId: any;
          skillId: any;
        }[] = [];
        const requirementRows = requirements.value[type];

        requirementRows.forEach((row) => {
          skillList.value.forEach((skill) => {
            const requiredCount = row[skill.name];
            // 只提交需求数量大于0的项
            if (requiredCount > 0) {
              requirementsList.push({
                shiftId: row.shiftId,
                skillId: skill.id,
                requiredCount,
              });
            }
          });
        });
        // 2. 构建与 DailyRequirementsDto 完全匹配的 payload
        const payload = {
          storeId,
          dayType: type,
          requirements: requirementsList,
        };

        // 3. 为每种日期类型调用一次保存接口
        // TODO: 调用保存排班需求的API
        return saveDailyRequirements(payload);
      }),
    );

    message.success('排班需求保存成功');
    // 可选: 保存成功后重新加载一次数据以确保同步
    await loadShiftsAndRequirements();
  } catch (error) {
    message.error('保存失败, 请稍后重试');
    console.error('保存排班需求失败:', error);
  } finally {
    requirementLoading.value = false;
  }
};
</script>

<template>
  <div class="page-container">
    <!-- 店铺列表视图 -->
    <div v-if="currentView === 'list'">
      <a-card title="店铺列表">
        <template #extra>
          <a-button type="primary" @click="handleAddStore">
            <template #icon><PlusOutlined /></template>
            新增店铺
          </a-button>
        </template>
        <a-table
          :columns="storeListColumns"
          :data-source="storeList"
          :loading="loading"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <!-- <template v-if="column.key === 'status'">
              <a-tag :color="record.status === '营业中' ? 'green' : 'red'">
                {{ record.status }}
              </a-tag>
            </template> -->
            <template v-if="column.key === 'action'">
              <a-button type="link" @click="goToDetails(record)">
                店铺管理
              </a-button>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 店铺详情视图 -->
    <div v-if="currentView === 'details' && selectedStore">
      <a-page-header
        :title="selectedStore.name"
        :sub-title="selectedStore.address"
        @back="goBackToList"
      >
        <template #backIcon><ArrowLeftOutlined /></template>
        <template #tags>
          <a-tag :color="selectedStore.status === '0' ? 'processing' : 'error'">
            {{ selectedStore.status === '0' ? '营业中' : '已关闭' }}
          </a-tag>
        </template>
      </a-page-header>

      <a-tabs v-model:active-key="activeTab" class="details-tabs">
        <a-tab-pane key="personnel" tab="人员管理">
          <template #tab> <UserOutlined /> 人员管理 </template>
          <a-card>
            <!-- TODO 新增人员按钮 -->
            <!-- <template #extra>
              <a-button type="primary" @click="handleAddEmployee">
                <template #icon><PlusOutlined /></template>
                新增人员
              </a-button>
            </template> -->
            <a-table
              :data-source="personnelList"
              :pagination="false"
              size="small"
              :loading="personnelListLoading"
            >
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
                  <a-tag v-for="skill in text" :key="skill.id" color="geekblue">
                    {{ skill.name }}
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
                        v-for="item in availableTimes as Availability[]"
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
              <a-table-column title="操作" key="action">
                <template #default="{ record }">
                  <a-button type="link" @click="handleEditEmployee(record)">
                    编辑
                  </a-button>
                </template>
              </a-table-column>
              <!-- </a-table>
            <a-table
              :columns="personnelColumns"
              :data-source="personnelList"
              :loading="personnelListLoading"
              row-key="id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'skills'">
                  <a-tag v-for="skill in record.skills" :key="skill.id">
                    {{ skill.name }}
                  </a-tag>
                </template>
                <template v-if="column.key === 'status'">
                  <a-tag :color="record.status === '在职' ? 'blue' : 'default'">
                    {{ record.status }}
                  </a-tag>
                </template>
                <template v-if="column.key === 'action'">
                  <a-button
                    type="link"
                    size="small"
                    @click="handleEditEmployee(record)"
                  >
                    <EditOutlined />
                  </a-button>
                </template>
              </template>
            </a-table> -->
            </a-table>
          </a-card>
        </a-tab-pane>

        <a-tab-pane key="skills" tab="技能管理">
          <template #tab> <SafetyCertificateOutlined /> 技能管理 </template>
          <a-card>
            <template #extra>
              <a-button type="primary" @click="handleAddSkill">
                <template #icon><PlusOutlined /></template>
                新增技能
              </a-button>
            </template>
            <a-table
              :columns="skillColumns"
              :data-source="skillList"
              :loading="skillListLoading"
              row-key="id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                  <a-space>
                    <a-button
                      type="link"
                      size="small"
                      @click="handleEditSkill(record)"
                    >
                      <EditOutlined />
                    </a-button>
                    <a-button
                      type="link"
                      size="small"
                      danger
                      @click="handleDeleteSkill(record)"
                    >
                      <DeleteOutlined />
                    </a-button>
                  </a-space>
                </template>
              </template>
            </a-table>
          </a-card>
        </a-tab-pane>

        <a-tab-pane key="shifts" tab="班次管理">
          <template #tab> <CoffeeOutlined /> 班次管理 </template>
          <a-card :loading="shiftListLoading">
            <template #title>班次与休息时间设置</template>
            <template #extra>
              <a-button type="primary" @click="handleAddShift">
                <PlusOutlined /> 新增班次
              </a-button>
            </template>
            <a-list item-layout="horizontal" :data-source="shifts">
              <template #renderItem="{ item }">
                <a-list-item>
                  <template #actions>
                    <a-button type="link" @click="handleEditShift(item)">
                      编辑
                    </a-button>
                    <a-button
                      type="link"
                      danger
                      @click="handleDeleteShift(item)"
                    >
                      删除
                    </a-button>
                  </template>
                  <a-list-item-meta>
                    <template #title>
                      <a-tag :color="item.colorCode">{{ item.name }}</a-tag>
                      <span
                        >{{ item.timeRange[0] }} - {{ item.timeRange[1] }}</span
                      >
                      <a-tag
                        v-if="item.isCrossDay"
                        color="purple"
                        style="margin-left: 8px"
                      >
                        跨天
                      </a-tag>
                    </template>
                    <template #description>
                      <div v-if="item.breakTimes && item.breakTimes.length > 0">
                        休息时段:
                        <a-tag
                          v-for="(bt, index) in item.breakTimes"
                          :key="index"
                          color="geekblue"
                        >
                          {{ bt.range[0] }} - {{ bt.range[1] }}
                        </a-tag>
                      </div>
                      <span v-else>无休息时段</span>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </template>
            </a-list>
          </a-card>
        </a-tab-pane>

        <!-- TODO: #1 新增 - 排班规则页签 -->
        <a-tab-pane key="rules" tab="排班规则">
          <template #tab> <BarChartOutlined /> 排班规则 </template>
          <a-card :loading="requirementLoading">
            <template #title>每日岗位人力需求</template>
            <template #extra>
              <a-button
                type="primary"
                @click="handleSaveRequirements"
                :loading="requirementLoading"
              >
                保存
              </a-button>
            </template>

            <a-tabs v-model:active-key="requirementDayType">
              <a-tab-pane key="weekday" tab="平日">
                <a-table
                  :columns="requirementColumns"
                  :data-source="requirements.weekday"
                  :pagination="false"
                  bordered
                  row-key="shiftId"
                >
                  <template #bodyCell="{ column, record }">
                    <template v-if="column.key !== 'shiftName'">
                      <a-input-number
                        v-model:value="record[column.dataIndex]"
                        :min="0"
                        style="width: 100%"
                      />
                    </template>
                  </template>
                </a-table>
              </a-tab-pane>
              <a-tab-pane key="holiday" tab="假日">
                <a-table
                  :columns="requirementColumns"
                  :data-source="requirements.holiday"
                  :pagination="false"
                  bordered
                  row-key="shiftId"
                >
                  <template #bodyCell="{ column, record }">
                    <template v-if="column.key !== 'shiftName'">
                      <a-input-number
                        v-model:value="record[column.dataIndex]"
                        :min="0"
                        style="width: 100%"
                      />
                    </template>
                  </template>
                </a-table>
              </a-tab-pane>
              <a-tab-pane key="special" tab="特殊节假日">
                <a-alert
                  message="特殊节假日的具体日期需要在“店铺事件”中单独设置。「尚未完善」"
                  type="info"
                  show-icon
                  class="mb-4"
                />
                <!-- <a-table
                  :columns="requirementColumns"
                  :data-source="requirements.special"
                  :pagination="false"
                  bordered
                  row-key="shiftId"
                >
                  <template #bodyCell="{ column, record }">
                    <template v-if="column.key !== 'shiftName'">
                      <a-input-number
                        v-model:value="record[column.dataIndex]"
                        :min="0"
                        style="width: 100%"
                      />
                    </template>
                  </template>
                </a-table> -->
              </a-tab-pane>
            </a-tabs>
          </a-card>
        </a-tab-pane>
      </a-tabs>
    </div>

    <a-modal
      v-model:visible="isShiftModalVisible"
      :title="modalTitle"
      width="600px"
      :confirm-loading="loading"
      @ok="handleShiftModalOk"
    >
      <a-form
        ref="shiftFormRef"
        :model="shiftForm"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item
          label="班次名称"
          name="name"
          :rules="[{ required: true, message: '请输入班次名称' }]"
        >
          <a-input v-model:value="shiftForm.name" />
        </a-form-item>
        <a-form-item
          label="班次简称"
          name="code"
          :rules="[{ required: true, message: '请输入班次简称' }]"
        >
          <a-input v-model:value="shiftForm.code" />
        </a-form-item>
        <a-form-item label="显示颜色" name="colorCode">
          <a-input
            v-model:value="shiftForm.colorCode"
            type="color"
            style="width: 100px"
          />
        </a-form-item>
        <a-form-item
          label="工作时段"
          name="timeRange"
          :rules="[{ required: true, message: '请选择工作时段' }]"
        >
          <a-time-range-picker
            v-model:value="shiftForm.timeRange"
            format="HH:mm"
            value-format="HH:mm"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="是否跨天" name="isCrossDay">
          <a-switch
            v-model:checked="shiftForm.isCrossDay"
            :checked-value="1"
            :un-checked-value="0"
          />
        </a-form-item>
        <a-form-item label="休息时段">
          <div
            v-for="(breakTime, index) in shiftForm.breakTimes"
            :key="index"
            class="mb-2 flex items-center"
          >
            <a-time-range-picker
              v-model:value="breakTime.range"
              format="HH:mm"
              value-format="HH:mm"
              style="flex-grow: 1"
            />
            <a-button
              type="text"
              danger
              @click="removeBreakTime(index)"
              class="ml-2"
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

    <!-- 新增/编辑店铺弹窗 -->
    <a-modal
      v-model:visible="isStoreModalVisible"
      :title="modalTitle"
      :confirm-loading="loading"
      @ok="handleStoreSubmit"
    >
      <a-form
        ref="storeFormRef"
        :model="storeForm"
        :rules="storeRules"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="店铺名称" name="name">
          <a-input
            v-model:value="storeForm.name"
            placeholder="请输入店铺名称"
          />
        </a-form-item>
        <a-form-item label="店铺地址" name="address">
          <a-input
            v-model:value="storeForm.address"
            placeholder="请输入店铺地址"
          />
        </a-form-item>
        <!-- <a-form-item label="店长姓名" name="managerName">
          <a-input
            v-model:value="storeForm.managerName"
            placeholder="请输入店长姓名"
          />
        </a-form-item> -->
        <a-form-item label="联系电话" name="contact">
          <a-input
            v-model:value="storeForm.contact"
            placeholder="请输入联系电话"
          />
        </a-form-item>
        <!-- <a-form-item label="店铺状态" name="status">
          <a-radio-group v-model:value="storeForm.status">
            <a-radio value="营业中">营业中</a-radio>
            <a-radio value="已关闭">已关闭</a-radio>
          </a-radio-group>
        </a-form-item> -->
      </a-form>
    </a-modal>

    <!-- 编辑员工弹窗 -->

    <EmployeeEditModal
      v-if="employeeForm"
      v-model:visible="isEmployeeModalVisible"
      :employee-data="employeeForm"
      :store-id="selectedStore?.id"
      :title="modalTitle"
      @submit="handleEmployeeSubmit"
    />

    <!-- 新增/编辑技能弹窗 -->
    <a-modal
      v-model:visible="isSkillModalVisible"
      :title="modalTitle"
      :confirm-loading="loading"
      @ok="handleSkillSubmit"
    >
      <a-form
        ref="skillFormRef"
        :model="skillForm"
        :rules="skillRules"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="技能名称" name="name">
          <a-input
            v-model:value="skillForm.name"
            placeholder="请输入技能名称"
          />
        </a-form-item>
        <a-form-item label="技能描述" name="description">
          <a-textarea
            v-model:value="skillForm.description"
            placeholder="请输入技能的详细描述"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- TODO: #1 新增 - 新增人员弹窗 -->
    <a-modal
      v-model:visible="isAddEmployeeModalVisible"
      title="新增人员到店铺"
      width="800px"
      :confirm-loading="loading"
      @ok="handleAddEmployeeSubmit"
    >
      <a-alert
        message="请从下方选择未分配到任何店铺的系统用户, 将他们加入当前店铺。"
        type="info"
        show-icon
        class="mb-4"
      />
      <a-table
        :columns="[
          { title: '登录名', dataIndex: 'userName', key: 'userName' },
          { title: '用户昵称', dataIndex: 'nickName', key: 'nickName' },
          { title: '所属部门', dataIndex: 'deptName', key: 'deptName' },
        ]"
        :data-source="unassignedUsers"
        :loading="addEmployeeLoading"
        :row-key="(record) => record.userId"
        :row-selection="{
          selectedRowKeys: selectedUserKeysForAdd,
          onChange: (keys) => (selectedUserKeysForAdd = keys),
        }"
        :pagination="{ pageSize: 5 }"
      />
    </a-modal>
  </div>
</template>

<style scoped lang="less">
.page-container {
  padding: 16px;
}
.details-tabs {
  background: #fff;
  padding: 0 24px 24px;
  border-radius: 0 0 8px 8px;
}
:deep(.ant-page-header) {
  background-color: #fff;
  border-radius: 8px 8px 0 0;
  padding: 16px 24px;
}
</style>
