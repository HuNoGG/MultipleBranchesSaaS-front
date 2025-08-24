/* eslint-disable */
<script setup lang="ts">
import type { TableColumnType } from 'ant-design-vue';

import { computed, reactive, ref, watch } from 'vue';

import { message } from 'ant-design-vue';

// TODO 1. 引入后台智能排班接口
import { generateSchedule } from '#/api/hrp/schedules';
import { skillsList } from '#/api/hrp/skills';
// 引入API
import { listUserprofileWithSkills } from '#/api/hrp/userProfile';
import { addUserSkill, removeUserSkill } from '#/api/hrp/userSkills';

// ========== Props and Emits ==========
const props = defineProps({
  visible: Boolean,
  storeId: {
    // 从父组件接收当前店铺ID
    type: Number,
    required: true,
  },
  // eslint-disable-next-line vue/require-default-prop
  employees: Array as () => Employee[],
  // eslint-disable-next-line vue/require-default-prop
  weekDays: Array as () => { key: string; label: string }[],
});

const emit = defineEmits(['update:visible', 'submit']);

// ========== 数据状态 ==========
const loading = ref(false);
const isModalVisible = ref(false);
const activeTab = ref('employeeManagement');

// 员工管理
interface Skill {
  id: number;
  name: string;
}
interface Employee {
  id: number;
  name: string;
  type: '兼职' | '正职' | string;
  skills: Skill[];
  daysOff: string[];
  isNew?: boolean;
  // 用于新增技能的临时状态
  newSkillId?: null | number;
}
const feedbackColumns: TableColumnType[] = [
  { title: '反馈信息', dataIndex: 'message', key: 'message' },
];

const localEmployees = ref<Employee[]>([]); // 当前排班的员工
const masterEmployees = ref<Employee[]>([]); // 从API获取的全店员工库

// 岗位需求
const allSkills = ref<{ id: number; name: string }[]>([]); // 从API获取
const localRequirements = reactive({
  '09:00-18:00': {},
  '18:00-23:00': {},
  '09:00-14:00': {},
  '18:00-22:00': {},
});

const requirementMeta = {
  '09:00-18:00': { label: '早班', color: '#e6f7ff' },
  '09:00-14:00': { label: '早班', color: '#e6f7ff' },
  '18:00-23:00': { label: '晚班', color: '#fffbe6' },
  '18:00-22:00': { label: '烊班', color: '#fff1f0' },
};

// 排班反馈
const isFeedbackVisible = ref(false);
const unassignedFeedback = ref([]);

// ========== API 调用 ==========
const fetchModalData = async () => {
  if (!props.storeId) return;
  loading.value = true;
  try {
    // 并行获取员工和技能数据
    const [employeeRes, skillsRes] = await Promise.all([
      listUserprofileWithSkills({ storeId: props.storeId }),
      skillsList(),
    ]);

    // 处理员工数据
    masterEmployees.value = employeeRes.map((e) => ({
      id: e.userId,
      name: e.userName,
      type: e.employeeType,
      skills: e.skills ? e.skills.map((s) => ({ id: s.id, name: s.name })) : [],
      daysOff: [],
      newSkillId: null,
    }));

    // 处理技能数据
    allSkills.value = skillsRes.rows.map((s) => ({ id: s.id, name: s.name }));
    // 基于获取的技能动态初始化岗位需求对象
    const skillTemplate = {};
    for (const skill of allSkills.value) {
      skillTemplate[skill.name] = 0;
    }
    localRequirements['09:00-18:00'] = {
      ...skillTemplate,
      柜台: 1,
      外场: 1,
      内场: 1,
    };
    localRequirements['18:00-23:00'] = {
      ...skillTemplate,
      柜台: 1,
      外场: 1,
      内场: 1,
      洗碗: 1,
      清洁: 1,
    };
    localRequirements['09:00-14:00'] = { ...skillTemplate, 外场: 1 };
    localRequirements['18:00-22:00'] = { ...skillTemplate, 内场: 1, 洗碗: 1 };
  } catch (error) {
    message.error('加载排班配置数据失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// ========== 监听与计算属性 ==========
watch(
  () => props.visible,
  (newValue) => {
    isModalVisible.value = newValue;
    if (newValue) {
      fetchModalData();
      localEmployees.value = JSON.parse(
        JSON.stringify(props.employees || []),
      ).map((emp) => ({
        ...emp,
        skills: emp.skills.map((skillName) => {
          const skillObj = allSkills.value.find((s) => s.name === skillName);
          return skillObj || { id: -1, name: skillName };
        }),
        newSkillId: null,
      }));
    }
  },
);

const weekDaysOptions = computed(
  () => props.weekDays?.map((d) => ({ value: d.label, label: d.label })) || [],
);

const employeeColumns: TableColumnType[] = [
  { title: '姓名', dataIndex: 'name', key: 'name', width: 120 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 80 },
  { title: '技能', dataIndex: 'skills', key: 'skills' },
  { title: '本周休息日', dataIndex: 'daysOff', key: 'daysOff', width: 200 },
  { title: '操作', dataIndex: 'action', key: 'action', width: 100 },
];

const availableMasterEmployees = computed(() => {
  const currentIds = new Set(localEmployees.value.map((e) => e.id));
  return masterEmployees.value.filter((e) => !currentIds.has(e.id));
});

// ========== 方法 ==========
const handleCancel = () => {
  isModalVisible.value = false;
  emit('update:visible', false);
};

const addEmployeeRow = () => {
  localEmployees.value.push({
    id: 0,
    name: '',
    type: '兼职',
    skills: [],
    daysOff: [],
    isNew: true,
    newSkillId: null,
  });
};

const handleEmployeeSelect = (employeeId: number, index: number) => {
  const selected = masterEmployees.value.find((e) => e.id === employeeId);
  if (selected) {
    localEmployees.value[index] = {
      ...selected,
      daysOff: [],
      isNew: false,
      newSkillId: null,
    };
  }
};

const removeEmployee = (id: number) => {
  localEmployees.value = localEmployees.value.filter((emp) => emp.id !== id);
};

const handleRemoveSkill = async (employee: Employee, skillToRemove: Skill) => {
  try {
    await removeUserSkill({ userId: employee.id, skillId: skillToRemove.id });
    employee.skills = employee.skills.filter(
      (skill) => skill.id !== skillToRemove.id,
    );
    message.success(
      `已删除员工 [${employee.name}] 的技能 [${skillToRemove.name}]`,
    );
  } catch (error) {
    message.error('删除技能失败');
    console.error('删除技能失败:', error);
  }
};

const handleAddSkill = async (employee: Employee) => {
  if (!employee.newSkillId) {
    message.warning('请选择要添加的技能');
    return;
  }
  const skillToAdd = allSkills.value.find((s) => s.id === employee.newSkillId);
  if (!skillToAdd) return;

  if (employee.skills.some((s) => s.id === skillToAdd.id)) {
    message.warning('该员工已拥有此技能');
    return;
  }

  try {
    await addUserSkill({ userId: employee.id, skillId: skillToAdd.id });
    employee.skills.push(skillToAdd);
    employee.newSkillId = null; // 重置选择器
    message.success(
      `已为员工 [${employee.name}] 添加技能 [${skillToAdd.name}]`,
    );
  } catch (error) {
    message.error('添加技能失败');
    console.error('添加技能失败:', error);
  }
};

const availableSkillsForEmployee = (employee: Employee) => {
  const currentSkillIds = new Set(employee.skills.map((s) => s.id));
  return allSkills.value.filter((s) => !currentSkillIds.has(s.id));
};

const runSchedulingAlgorithm = async () => {
  if (!props.weekDays || props.weekDays.length === 0) {
    message.error('周数据不正确，无法排班');
    return;
  }
  loading.value = true;
  try {
    const payload = {
      storeId: props.storeId,
      startDate: props.weekDays[0].key,
      endDate: props.weekDays[6].key,
      employees: localEmployees.value.map((emp) => ({
        id: emp.id,
        daysOff: emp.daysOff,
      })),
      requirements: localRequirements,
    };

    const result = await generateSchedule(payload);

    if (result.feedbackMessages && result.feedbackMessages.length > 0) {
      // 如果有反馈信息，则展示反馈弹窗
      unassignedFeedback.value = result.feedbackMessages.map((msg) => ({
        message: msg,
        key: msg,
      }));
      isFeedbackVisible.value = true;
      message.warning('排班已完成，但存在一些问题，请查看反馈。');
    } else {
      // 如果没有反馈信息，则直接成功
      message.success('智能排班成功！');
      emit('submit'); // 通知父组件刷新
      handleCancel(); // 关闭主弹窗
    }
  } catch (error) {
    console.error('智能排班失败:', error);
    message.error('智能排班失败，请检查配置或联系管理员');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <a-modal
    v-model:visible="isModalVisible"
    title="智能排班"
    width="850px"
    ok-text="开始排班"
    cancel-text="取消"
    :confirm-loading="loading"
    @cancel="handleCancel"
    @ok="runSchedulingAlgorithm"
  >
    <a-spin :spinning="loading">
      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="employeeManagement" tab="员工管理">
          <a-table
            :columns="employeeColumns"
            :data-source="localEmployees"
            :pagination="false"
            bordered
            size="small"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.dataIndex === 'name'">
                <a-select
                  v-if="record.isNew"
                  v-model:value="record.id"
                  placeholder="请选择员工"
                  style="width: 100%"
                  show-search
                  @change="
                    (employeeId) => handleEmployeeSelect(employeeId, index)
                  "
                >
                  <a-select-option
                    v-for="emp in availableMasterEmployees"
                    :key="emp.id"
                    :value="emp.id"
                  >
                    {{ emp.name }}
                  </a-select-option>
                </a-select>
                <span v-else>{{ record.name }}</span>
              </template>
              <template v-if="column.dataIndex === 'skills'">
                <div
                  style="
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                    align-items: center;
                  "
                >
                  <a-tag
                    v-for="skill in record.skills"
                    :key="skill.id"
                    color="blue"
                    closable
                    @close.prevent="handleRemoveSkill(record, skill)"
                  >
                    {{ skill.name }}
                  </a-tag>
                  <a-select
                    v-if="
                      !record.isNew &&
                      availableSkillsForEmployee(record).length > 0
                    "
                    v-model:value="record.newSkillId"
                    size="small"
                    style="width: 100px"
                    placeholder="新增技能"
                  >
                    <a-select-option
                      v-for="skill in availableSkillsForEmployee(record)"
                      :key="skill.id"
                      :value="skill.id"
                    >
                      {{ skill.name }}
                    </a-select-option>
                  </a-select>
                  <a-button
                    v-if="!record.isNew && record.newSkillId"
                    type="primary"
                    size="small"
                    @click="handleAddSkill(record)"
                  >
                    添加
                  </a-button>
                </div>
              </template>
              <template v-if="column.dataIndex === 'daysOff'">
                <a-select
                  v-model:value="record.daysOff"
                  mode="multiple"
                  placeholder="请选择休息日"
                  style="width: 100%"
                  :options="weekDaysOptions"
                />
              </template>
              <template v-if="column.dataIndex === 'action'">
                <a-space>
                  <a-button type="link" size="small">查看</a-button>
                  <a-popconfirm
                    title="确定删除该员工吗？"
                    @confirm="removeEmployee(record.id)"
                  >
                    <a-button type="link" size="small" danger>删除</a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </template>
          </a-table>
          <a-button type="dashed" block class="mt-4" @click="addEmployeeRow">
            添加员工
          </a-button>
        </a-tab-pane>

        <a-tab-pane key="requirementsConfig" tab="岗位需求配置">
          <a-alert
            message="请在下方表格内配置每日各时段所需人数"
            type="info"
            show-icon
          />
          <a-card
            v-for="(req, timeSlot) in localRequirements"
            :key="timeSlot"
            class="mt-4"
            :body-style="{ paddingTop: '16px' }"
          >
            <template #title>
              <div
                :style="{
                  backgroundColor: requirementMeta[timeSlot]?.color,
                  padding: '4px 8px',
                  borderRadius: '4px',
                }"
              >
                <a-tag
                  :color="
                    requirementMeta[timeSlot]?.color ? undefined : 'default'
                  "
                >
                  {{ requirementMeta[timeSlot]?.label || '时段' }}
                </a-tag>
                <span>{{ timeSlot }}</span>
              </div>
            </template>
            <a-row :gutter="16">
              <a-col v-for="skill in allSkills" :key="skill.id" :span="4">
                <a-form-item :label="skill.name">
                  <a-input-number
                    v-model:value="req[skill.name]"
                    :min="0"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-card>
        </a-tab-pane>
      </a-tabs>
    </a-spin>
  </a-modal>

  <a-modal
    v-model:visible="isFeedbackVisible"
    title="智能排班结果反馈"
    @ok="isFeedbackVisible = false"
  >
    <a-alert
      message="请检查以下问题并调整您的配置后重试。"
      type="warning"
      show-icon
    />
    <a-table
      :columns="feedbackColumns"
      :data-source="unassignedFeedback"
      :pagination="false"
      bordered
      size="small"
      class="mt-4"
    />
  </a-modal>
</template>

<style scoped>
.mt-4 {
  margin-top: 16px;
}
</style>
