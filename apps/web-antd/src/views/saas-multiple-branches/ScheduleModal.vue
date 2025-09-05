<script setup lang="ts">
/* eslint-disable */
import type { TableColumnType } from 'ant-design-vue';
import { computed, reactive, ref, watch } from 'vue';
import { message, Modal, Tag } from 'ant-design-vue';
import dayjs from 'dayjs';

// TODO: 引入所有需要的API
import { generateSchedule, getWeeklySchedule } from '#/api/hrp/schedules'; // 引入getWeeklySchedule获取上周数据
import { scheduleRequirementsAllTypeList } from '#/api/hrp/scheduleRequirements';
import { shiftsAndRestTime } from '#/api/hrp/shifts';
import { skillsList } from '#/api/hrp/skills';
import { listUserprofileWithSkills } from '#/api/hrp/userProfile';
// TODO: #1 引入更新用户技能的API
import { addUserSkill, removeUserSkill } from '#/api/hrp/userSkills';
import { h } from 'vue';
import { useDraggable } from '@vueuse/core';
import { watchEffect } from 'vue';

// ========== Props and Emits ==========
const props = defineProps({
  visible: Boolean,
  storeId: {
    type: Number,
    required: true,
  },
  initialData: {
    type: Object,
    default: () => ({}),
  },
});
const emit = defineEmits(['update:visible', 'submit']);

// ========== 弹窗基础状态 ==========
const isModalVisible = ref(false);
const loading = ref(true);
const activeTab = ref('employeeManagement');
const isFeedbackVisible = ref(false);

// ========== 员工管理页签状态 ==========
const employeeColumns: TableColumnType[] = [
  { title: '姓名', dataIndex: 'userName', key: 'userName' },
  { title: '类型', dataIndex: 'employeeType', key: 'employeeType' },
  { title: '技能', dataIndex: 'skills', key: 'skills', width: '50%' },
];
const allEmployees = ref<any[]>([]);
const selectedEmployeeKeys = ref<number[]>([]);

// ========== TODO: #1 & #2 岗位需求配置页签状态重构 ==========
const allSkills = ref<any[]>([]);
const allShifts = ref<any[]>([]); // 存储班次定义
const requirements = ref<any>({}); // key为日期 'YYYY-MM-DD', value为该日期的需求
const activeRequirementDay = ref(''); // 当前选中的日期页签
const enableRestDaySubstitution = ref(true); // #1 新增: 是否休息补替

// #2 新增: 为日期页签生成数据
const weekDaysForTabs = computed(() => {
  debugger;
  if (!props.initialData.initialDate) return [];
  const startOfWeek = dayjs(props.initialData.initialDate).startOf('week');
  const days = [];
  for (let i = 0; i < 7; i++) {
    const currentDay = startOfWeek.add(i, 'day');
    days.push({
      key: currentDay.format('YYYY-MM-DD'),
      label: `周${['一', '二', '三', '四', '五', '六', '日'][i]}`,
    });
  }
  return days;
});

// ========== 反馈信息状态 ==========
const unassignedFeedback = ref([]);
const feedbackColumns = [
  { title: '问题描述', dataIndex: 'message', key: 'message' },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 150,
    customRender: ({ text }) => {
      let color = 'default';
      let content = text;
      switch (text) {
        case 'MANPOWER_SHORTAGE':
          color = 'error'; // 红色
          content = '人力缺口';
          break;
        case 'CONSTRAINT_VIOLATION':
          color = 'warning'; // 橙色
          content = '规则冲突';
          break;
        case 'SYSTEM_WARNING':
          color = 'processing'; // 蓝色
          content = '系统警告';
          break;
      }
      // 使用 h 函数渲染 Ant Design Vue 的 Tag 组件
      return h(Tag, { color: color }, () => content);
    },
  },
];

// ========== 核心方法 ==========
const fetchInitialData = async () => {
  if (!props.storeId) return;
  loading.value = true;
  try {
    await Promise.all([
      fetchEmployees(),
      fetchRequirementsAndShifts(), // 此方法已重构
    ]);
    // 默认激活本周的第一天
    if (weekDaysForTabs.value.length > 0) {
      activeRequirementDay.value = weekDaysForTabs.value[0].key;
    }
  } catch (error) {
    message.error('加载排班配置信息失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const fetchEmployees = async () => {
  const res = await listUserprofileWithSkills({ storeId: props.storeId });
  allEmployees.value = res.map((emp) => ({
    ...emp,
    skillIds: (emp.skills || []).map((s) => s.id), // 提取技能ID数组用于v-model绑定
  }));
  selectedEmployeeKeys.value = allEmployees.value.map((e) => e.userId);
};

// TODO: #2 重构 - 加载每日需求
const fetchRequirementsAndShifts = async () => {
  const storeId = props.storeId;
  const currentStartDate = dayjs(props.initialData.initialDate).startOf('week');
  const lastWeekStartDate = currentStartDate
    .subtract(1, 'week')
    .format('YYYY-MM-DD');

  // 1. 获取基础信息: 技能和班次定义
  const [skillsRes, shiftsRes] = await Promise.all([
    skillsList({ storeId }),
    shiftsAndRestTime({ storeId }),
  ]);
  allSkills.value = skillsRes.rows;
  allShifts.value = shiftsRes || [];

  // 2. 获取数据源: 优先上周数据, 其次是模板数据
  let dataSource;
  try {
    const lastWeekRes = await getWeeklySchedule({
      storeId,
      startDate: lastWeekStartDate,
      endDate: currentStartDate.subtract(1, 'day').format('YYYY-MM-DD'),
    });
    debugger;
    // 检查上周数据是否有效
    if (lastWeekRes && Object.keys(lastWeekRes.scheduleRows).length > 0) {
      dataSource = { type: 'last_week', data: lastWeekRes };
      message.success('已加载上周排班作为默认需求');
    } else {
      throw new Error('上周无排班数据');
    }
  } catch (e) {
    console.warn('获取上周排班数据失败, 将使用模板数据:', e);
    const templateRes = await scheduleRequirementsAllTypeList({ storeId });
    dataSource = { type: 'template', data: templateRes };
    message.info('未找到上周排班, 已加载模板作为默认需求');
  }

  // 3. 构建每日需求
  const newRequirements = {};
  for (const day of weekDaysForTabs.value) {
    const dateStr = day.key;
    const newDayReqs = {};

    allShifts.value.forEach((shift) => {
      const timeSlot = `${shift.startTime.substring(0, 5)}-${shift.endTime.substring(0, 5)}`;
      const reqRow = {
        shiftId: shift.id,
        label: shift.name,
        color: shift.colorCode,
        skills: {},
      };
      allSkills.value.forEach((skill) => {
        reqRow.skills[skill.name] = 0; // 初始化为0
      });
      newDayReqs[timeSlot] = reqRow;
    });
    debugger;
    // 4. 用数据源填充
    if (dataSource.type === 'template') {
      const dayOfWeek = dayjs(dateStr).day();
      // 周一到周五(day 1-5)用平日模板, 周六日(day 6,0)用假日模板
      const dayTypeKey =
        dayOfWeek >= 1 && dayOfWeek <= 5 ? 'weekday' : 'holiday';
      const templateReqs = dataSource.data[dayTypeKey] || [];
      templateReqs.forEach((req) => {
        const shift = allShifts.value.find((s) => s.id === req.shiftId);
        const skill = allSkills.value.find((s) => s.id === req.skillId);
        if (shift && skill) {
          const timeSlot = `${shift.startTime.substring(0, 5)}-${shift.endTime.substring(0, 5)}`;
          if (newDayReqs[timeSlot]) {
            newDayReqs[timeSlot].skills[skill.name] = req.requiredCount;
          }
        }
      });
    } else {
      dataSource.type === 'last_week';
      const lastWeekDateStr = dayjs(dateStr)
        .subtract(1, 'week')
        .format('YYYY-MM-DD');
      for (const empId in dataSource.data.scheduleRows) {
        const daySchedules =
          dataSource.data.scheduleRows[empId][lastWeekDateStr] || [];
        daySchedules.forEach((schedule) => {
          const shift = allShifts.value.find((s) => s.id === schedule.shiftId);
          const skill = allSkills.value.find((s) => s.id === schedule.skillId);
          if (shift && skill) {
            const timeSlot = `${shift.startTime.substring(0, 5)}-${shift.endTime.substring(0, 5)}`;
            if (newDayReqs[timeSlot]) {
              // 累加每个岗位的需求人数
              newDayReqs[timeSlot].skills[skill.name] =
                (newDayReqs[timeSlot].skills[skill.name] || 0) + 1;
            }
          }
        });
      }
    }
    newRequirements[dateStr] = newDayReqs;
  }
  requirements.value = newRequirements;
};

// "开始排班"
const handleOk = async () => {
  if (selectedEmployeeKeys.value.length === 0) {
    message.warn('请至少选择一名员工参与排班');
    return;
  }
  loading.value = true;

  const employeeConfigs = selectedEmployeeKeys.value.map((key) => ({
    id: key,
    daysOff: [],
  }));

  // TODO: #2 重构需求参数, 以按天为单位提交
  const requirementsByDay = {};
  for (const date in requirements.value) {
    const dayReq = {};
    const dayReqHasValue = Object.values(requirements.value[date]).some(
      (shift) =>
        Object.values((shift as any).skills).some(
          (count) => (count as number) > 0,
        ),
    );

    if (dayReqHasValue) {
      for (const timeSlot in requirements.value[date]) {
        const shiftReq = requirements.value[date][timeSlot];
        const skillReqs = {};
        let hasValueInTimeSlot = false;
        for (const skillName in shiftReq.skills) {
          const count = shiftReq.skills[skillName];
          if (count > 0) {
            skillReqs[skillName] = count;
            hasValueInTimeSlot = true;
          }
        }
        if (hasValueInTimeSlot) {
          dayReq[timeSlot] = skillReqs;
        }
      }
    }
    if (Object.keys(dayReq).length > 0) {
      requirementsByDay[date] = dayReq;
    }
  }

  const params = {
    storeId: props.storeId,
    startDate: dayjs(props.initialData.initialDate)
      .startOf('week')
      .format('YYYY-MM-DD'),
    endDate: dayjs(props.initialData.initialDate)
      .endOf('week')
      .format('YYYY-MM-DD'),
    schedulingMode: 'AVERAGE',
    employees: employeeConfigs,
    requirementsByDay: requirementsByDay, // TODO: #2 传递按天组织的需求
    enableRestDaySubstitution: enableRestDaySubstitution.value, // TODO: #1 传递新参数
  };

  try {
    const res = await generateSchedule(params);
    if (res.feedbackItems && res.feedbackItems.length >= 0) {
      unassignedFeedback.value = res.feedbackItems;
      isFeedbackVisible.value = true;
    } else {
      message.success('智能排班成功！');
    }
    emit('submit');
    handleCancel();
  } catch (error) {
    message.error('排班失败，请检查配置或联系管理员');
    console.error('排班API调用失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  isModalVisible.value = false;
  emit('update:visible', false);
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
    await addUserSkill({ userId: employee.userId, skillId: skillToAdd.id });
    employee.skills.push(skillToAdd);
    employee.newSkillId = null; // 重置选择器
    message.success(
      `已为员工 [${employee.userName}] 添加技能 [${skillToAdd.name}]`,
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

// 监听
watch(
  () => props.visible,
  (newVal) => {
    isModalVisible.value = newVal;
    if (newVal) {
      fetchInitialData();
    }
  },
);
const modalRef = ref<HTMLElement>(null);
const startX = ref<number>(0);
const startY = ref<number>(0);
const startedDrag = ref(false);
const transformX = ref(0);
const transformY = ref(0);
const preTransformX = ref(0);
const preTransformY = ref(0);
const dragRect = ref({ left: 0, right: 0, top: 0, bottom: 0 });
const { x, y, isDragging } = useDraggable(modalRef);
watch([x, y], () => {
  if (!startedDrag.value) {
    startX.value = x.value;
    startY.value = y.value;
    const bodyRect = document.body.getBoundingClientRect();
    const titleRect = modalRef.value.getBoundingClientRect();
    dragRect.value.right = bodyRect.width - titleRect.width;
    dragRect.value.bottom = bodyRect.height - titleRect.height;
    preTransformX.value = transformX.value;
    preTransformY.value = transformY.value;
  }
  startedDrag.value = true;
});
watch(isDragging, () => {
  if (!isDragging) {
    startedDrag.value = false;
  }
});

watchEffect(() => {
  if (startedDrag.value) {
    transformX.value =
      preTransformX.value +
      Math.min(Math.max(dragRect.value.left, x.value), dragRect.value.right) -
      startX.value;
    transformY.value =
      preTransformY.value +
      Math.min(Math.max(dragRect.value.top, y.value), dragRect.value.bottom) -
      startY.value;
  }
});
</script>

<template>
  <a-modal
    v-model:visible="isModalVisible"
    width="1500px"
    :confirm-loading="loading"
    @ok="handleOk"
    @cancel="handleCancel"
    ok-text="开始排班"
    cancel-text="取消"
  >
    <template #title>
      <div ref="modalRef" style="width: 100%; cursor: move">手动排班配置</div>
    </template>
    <a-spin :spinning="loading">
      <a-tabs v-model:activeKey="activeTab">
        <!-- 员工管理页签 -->
        <a-tab-pane key="employeeManagement" tab="员工管理">
          <a-alert
            message="请选择需要参与本次排班的员工, 并可在此处直接调整员工技能。"
            type="info"
            show-icon
            class="mb-4"
          />
          <a-table
            :columns="employeeColumns"
            :data-source="allEmployees"
            :row-key="(record) => record.userId"
            :pagination="false"
            size="small"
            :row-selection="{
              selectedRowKeys: selectedEmployeeKeys,
              onChange: (keys) => (selectedEmployeeKeys = keys),
            }"
          >
            <template #bodyCell="{ column, record }">
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
            </template>
          </a-table>
        </a-tab-pane>

        <!-- TODO: #1 & #2 岗位需求配置页签重构 -->
        <a-tab-pane key="requirements" tab="岗位需求配置">
          <a-row justify="space-between" align="middle" class="mb-4">
            <a-col>
              <a-alert
                message="请为本周的每一天配置所需的岗位人数。默认继承上周排班数据，若无则使用模板。"
                type="info"
                show-icon
              />
            </a-col>
            <a-col>
              <!-- #1 新增: 是否休息补替 -->
              <a-form-item label="是否休息补替" style="margin-bottom: 0">
                <a-switch v-model:checked="enableRestDaySubstitution" />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- #2 新增: 周一到周日的页签 -->
          <a-tabs v-model:activeKey="activeRequirementDay" tab-position="left">
            <a-tab-pane
              v-for="day in weekDaysForTabs"
              :key="day.key"
              :tab="day.label"
            >
              <div
                v-if="activeRequirementDay === day.key"
                style="max-height: 400px; padding-right: 16px; overflow-y: auto"
              >
                <a-card
                  v-for="(req, timeSlot) in requirements[day.key]"
                  :key="timeSlot"
                  class="mb-4"
                  size="small"
                >
                  <template #title>
                    <a-tag :color="req.color || 'default'">{{
                      req.label || '时段'
                    }}</a-tag>
                    <span>{{ timeSlot }}</span>
                  </template>
                  <a-row :gutter="16">
                    <a-col v-for="skill in allSkills" :key="skill.id" :span="6">
                      <a-form-item :label="skill.name">
                        <a-input-number
                          v-model:value="req.skills[skill.name]"
                          :min="0"
                          style="width: 100%"
                        />
                      </a-form-item>
                    </a-col>
                  </a-row>
                </a-card>
              </div>
            </a-tab-pane>
          </a-tabs>
        </a-tab-pane>
      </a-tabs>
    </a-spin>
  </a-modal>

  <!-- 排班结果反馈弹窗 -->
  <a-modal
    v-model:visible="isFeedbackVisible"
    title="智能排班结果反馈"
    @ok="isFeedbackVisible = false"
  >
    <a-alert
      message="排班已完成, 但存在以下问题, 建议您调整配置或手动补齐排班。"
      type="warning"
      show-icon
    />
    <a-table
      :columns="feedbackColumns"
      :data-source="unassignedFeedback"
      :pagination="false"
      class="mt-4"
    />
  </a-modal>
</template>

<style scoped lang="less">
// 可以根据需要添加样式
:deep(.ant-tabs-left > .ant-tabs-nav) {
  margin-right: 24px;
}
</style>
