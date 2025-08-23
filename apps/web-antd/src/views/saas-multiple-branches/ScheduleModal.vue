/* eslint-disable */
<script setup lang="ts">
/* eslint-disable unicorn/no-nested-ternary */
import type { TableColumnType } from 'ant-design-vue';

import { computed, reactive, ref, watch } from 'vue';

import { message } from 'ant-design-vue';

import { skillsList } from '#/api/hrp/skills';
// 引入API
import { listUserprofileWithSkills } from '#/api/hrp/userProfile';

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
interface Employee {
  id: number;
  name: string;
  type: '兼职' | '正职' | string;
  skills: string[];
  daysOff: string[];
  isNew?: boolean;
}
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

// 排班反馈
const isFeedbackVisible = ref(false);
const unassignedFeedback = ref([]);
const feedbackColumns: TableColumnType[] = [
  { title: '日期', dataIndex: 'day', key: 'day' },
  { title: '时间段', dataIndex: 'timeSlot', key: 'timeSlot' },
  { title: '岗位缺口', dataIndex: 'gaps', key: 'gaps' },
];

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
    debugger;

    // 处理员工数据
    masterEmployees.value = employeeRes.map((e) => ({
      id: e.userId,
      name: e.userName,
      type: e.employeeType,
      skills: e.skills ? e.skills.map((s) => s.name) : [],
      daysOff: [],
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
      // 弹窗打开时，获取最新数据
      fetchModalData();
      // 并同步父组件传入的当前已在排班列表的员工
      localEmployees.value = JSON.parse(JSON.stringify(props.employees || []));
    }
  },
);

const weekDaysOptions = computed(
  () => props.weekDays?.map((d) => ({ value: d.label, label: d.label })) || [],
);

const employeeColumns: TableColumnType[] = [
  { title: '姓名', dataIndex: 'name', key: 'name', width: 150 },
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '技能', dataIndex: 'skills', key: 'skills' },
  { title: '本周休息日', dataIndex: 'daysOff', key: 'daysOff', width: 220 },
  { title: '操作', dataIndex: 'action', key: 'action' },
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
  });
};

const handleEmployeeSelect = (employeeId: number, index: number) => {
  const selected = masterEmployees.value.find((e) => e.id === employeeId);
  if (selected) {
    localEmployees.value[index] = { ...selected, daysOff: [], isNew: false };
  }
};

const removeEmployee = (id: number) => {
  localEmployees.value = localEmployees.value.filter((emp) => emp.id !== id);
};

const runSchedulingAlgorithm = () => {
  // 算法逻辑保持不变，但现在使用的是从API获取的数据
  const newSchedule = {};
  const feedback = [];

  props.weekDays?.forEach((day) => {
    const scheduledToday = new Set<number>();
    Object.keys(localRequirements).forEach((timeSlot) => {
      Object.keys(localRequirements[timeSlot]).forEach((skill) => {
        let needed = localRequirements[timeSlot][skill];
        if (needed <= 0) return;

        const available = localEmployees.value.filter(
          (emp) =>
            !emp.daysOff.includes(day.label) &&
            emp.skills.includes(skill) &&
            !scheduledToday.has(emp.id),
        );

        for (const emp of available) {
          if (needed <= 0) break;
          if (!newSchedule[emp.id]) newSchedule[emp.id] = {};
          const shiftType =
            emp.type === '正职'
              ? 'FullTime'
              : timeSlot.startsWith('09')
                ? 'PartTimeMorning'
                : 'PartTimeEvening';
          newSchedule[emp.id][day.key] = {
            position: skill,
            timeRange: timeSlot.replace('~', '-'),
            duration: 5,
            shiftType,
            shiftLabel: `${emp.type}-${skill}`,
          };
          scheduledToday.add(emp.id);
          needed--;
        }

        if (needed > 0) {
          feedback.push({
            day: day.label,
            timeSlot,
            gaps: `${skill}*${needed}`,
          });
        }
      });
    });
  });

  unassignedFeedback.value = feedback;
  if (feedback.length > 0) {
    // isFeedbackVisible.value = true;
  }

  emit('submit', newSchedule);
  handleCancel();
};
</script>

<template>
  <!-- 智能排班主弹窗 -->
  <a-modal
    v-model:visible="isModalVisible"
    title="智能排班"
    width="800px"
    ok-text="开始排班"
    cancel-text="取消"
    :confirm-loading="loading"
    @cancel="handleCancel"
    @ok="runSchedulingAlgorithm"
  >
    <a-spin :spinning="loading">
      <a-tabs v-model:active-key="activeTab">
        <!-- 员工管理 Tab -->
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
                <a-tag v-for="skill in record.skills" :key="skill" color="blue">
                  {{ skill }}
                </a-tag>
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

        <!-- 岗位需求配置 Tab -->
        <a-tab-pane key="requirementsConfig" tab="岗位需求配置">
          <a-alert
            message="请在下方表格内配置每日各时段所需人数"
            type="info"
            show-icon
          />
          <a-card
            v-for="(req, timeSlot) in localRequirements"
            :key="timeSlot"
            :title="`时段 ${timeSlot}`"
            class="mt-4"
          >
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

  <!-- 排班结果反馈弹窗 -->
  <a-modal
    v-model:visible="isFeedbackVisible"
    title="智能排班结果反馈"
    @ok="isFeedbackVisible = false"
  >
    <a-alert
      message="智能排班已完成，但部分时间段存在岗位缺口，请及时进行调整。"
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
