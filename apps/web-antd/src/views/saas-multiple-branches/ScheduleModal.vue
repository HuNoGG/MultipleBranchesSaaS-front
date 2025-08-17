/* eslint-disable */
<script setup lang="ts">
/* eslint-disable unicorn/no-nested-ternary */
import type { TableColumnType } from 'ant-design-vue';

import { computed, reactive, ref, watch } from 'vue';

// ========== Props and Emits ==========
const props = defineProps({
  visible: Boolean,
  // eslint-disable-next-line vue/require-default-prop
  employees: Array as () => Employee[],
  // eslint-disable-next-line vue/require-default-prop
  weekDays: Array as () => { key: string; label: string }[],
});

const emit = defineEmits(['update:visible', 'submit']);

// ========== Master Data (模拟全公司员工库) ==========
const masterEmployees = [
  { id: 1, name: '张小花', type: '正职', skills: ['柜台', '外场', '内场'] },
  { id: 2, name: '李小明', type: '正职', skills: ['内场', '洗碗', '清洁'] },
  { id: 3, name: '王小红', type: '正职', skills: ['柜台', '外场'] },
  { id: 4, name: '赵小刚', type: '正职', skills: ['内场', '清洁', '外场'] },
  { id: 5, name: '孙小美', type: '正职', skills: ['柜台', '洗碗'] },
  { id: 6, name: '周小强', type: '兼职', skills: ['外场', '清洁'] },
  { id: 7, name: '吴小丽', type: '兼职', skills: ['内场', '洗碗'] },
  { id: 8, name: '郑小伟', type: '兼职', skills: ['柜台'] },
  { id: 9, name: '陈师傅', type: '兼职', skills: ['清洁', '洗碗'] },
];

// ========== Modal & Tabs State ==========
const isModalVisible = ref(false);
const activeTab = ref('employeeManagement');

const weekDaysOptions = computed(
  () => props.weekDays?.map((d) => ({ value: d.label, label: d.label })) || [],
);

watch(
  () => props.visible,
  (newValue) => {
    isModalVisible.value = newValue;
    if (newValue && props.employees) {
      // eslint-disable-next-line unicorn/prefer-structured-clone
      localEmployees.value = JSON.parse(JSON.stringify(props.employees));
    }
  },
);

const handleCancel = () => {
  isModalVisible.value = false;
  emit('update:visible', false);
};

// ========== Employee Management ==========
interface Employee {
  id: number;
  name: string;
  type: '兼职' | '正职';
  skills: string[];
  daysOff: string[];
  isNew?: boolean; // 标记是否为新添加的行
}
const localEmployees = ref<Employee[]>([]);

const employeeColumns: TableColumnType[] = [
  { title: '姓名', dataIndex: 'name', key: 'name', width: 150 },
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '技能', dataIndex: 'skills', key: 'skills' },
  { title: '本周休息日', dataIndex: 'daysOff', key: 'daysOff', width: 220 },
  { title: '操作', dataIndex: 'action', key: 'action' },
];

// 计算主员工库中尚未被添加到当前排班列表的员工
const availableMasterEmployees = computed(() => {
  const currentIds = new Set(localEmployees.value.map((e) => e.id));
  return masterEmployees.filter((e) => !currentIds.has(e.id));
});

const addEmployeeRow = () => {
  localEmployees.value.push({
    id: 0, // 临时ID
    name: '',
    type: '兼职',
    skills: [],
    daysOff: [],
    isNew: true, // 标记为新行，显示下拉选择
  });
};

const handleEmployeeSelect = (employeeId: number, index: number) => {
  const selected = masterEmployees.find((e) => e.id === employeeId);
  if (selected) {
    localEmployees.value[index] = { ...selected, daysOff: [], isNew: false };
  }
};

const removeEmployee = (id: number) => {
  localEmployees.value = localEmployees.value.filter((emp) => emp.id !== id);
};

// ========== Requirements Config ==========
const allSkills = ['柜台', '外场', '内场', '洗碗', '清洁'];
const localRequirements = reactive({
  '09:00-18:00': { 柜台: 1, 外场: 1, 内场: 1, 洗碗: 0, 清洁: 0 },
  '18:00-23:00': { 柜台: 1, 外场: 1, 内场: 1, 洗碗: 1, 清洁: 1 },
  '09:00-14:00': { 柜台: 0, 外场: 1, 内场: 0, 洗碗: 0, 清洁: 0 },
  '18:00-22:00': { 柜台: 0, 外场: 0, 内场: 1, 洗碗: 1, 清洁: 0 },
});

// ========== Scheduling Logic & Feedback ==========
const isFeedbackVisible = ref(false);
const unassignedFeedback = ref([]);
const feedbackColumns: TableColumnType[] = [
  { title: '日期', dataIndex: 'day', key: 'day' },
  { title: '时间段', dataIndex: 'timeSlot', key: 'timeSlot' },
  { title: '岗位缺口', dataIndex: 'gaps', key: 'gaps' },
];

const runSchedulingAlgorithm = () => {
  // TODO: 此处为简易的前端排班算法，未来应替换为调用后端接口
  const newSchedule = {};
  const feedback = [];

  props.weekDays?.forEach((day) => {
    const scheduledToday = new Set<number>(); // 当天已排班的员工ID
    Object.keys(localRequirements).forEach((timeSlot) => {
      Object.keys(localRequirements[timeSlot]).forEach((skill) => {
        let needed = localRequirements[timeSlot][skill];
        if (needed <= 0) return;

        // 寻找可用员工
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
            duration: 5, // 简化计算
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
    isFeedbackVisible.value = true;
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
    @cancel="handleCancel"
    @ok="runSchedulingAlgorithm"
  >
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
            <a-col v-for="skill in allSkills" :key="skill" :span="4">
              <a-form-item :label="skill">
                <a-input-number
                  v-model:value="req[skill]"
                  :min="0"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>
      </a-tab-pane>
    </a-tabs>
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
