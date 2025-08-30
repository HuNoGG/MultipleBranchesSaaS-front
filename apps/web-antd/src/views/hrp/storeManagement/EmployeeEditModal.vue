<script setup lang="ts">
import type { SkillsVO } from '../skills/model';

import type { Availability } from '#/api/hrp/userAvailability/model';

import { onMounted, reactive, ref, watch } from 'vue';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

import { skillsList } from '#/api/hrp/skills';
import { saveExtendedInfo } from '#/api/hrp/userProfile';

// ========== 数据模型定义 ==========
interface Skill {
  id: number;
  name: string;
}
interface Store {
  id: number;
  name: string;
}
interface Employee {
  id: number;
  userName: string;
  type: string;
  skills: number[];
  priority: number;
  availableTimes: Availability[];
  supportStoreIds: number[];
  storeId: number; // 当前员工所属店铺ID
}

// ========== Props and Emits ==========
const props = defineProps({
  visible: Boolean,
  employeeData: {
    type: Object as () => Employee,
    required: true,
  },
  storeId: {
    type: String,
    required: true,
  },
  allStores: {
    type: Array as () => Store[],
    default: () => [],
  },
  title: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:visible', 'submit']);

// ========== 状态管理 ==========
const isModalVisible = ref(false);
const loading = ref(false);
const formState = reactive<Partial<Employee>>({});
const allSkills = ref<SkillsVO[]>([]);
const weekDayOptions = [
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 },
  { label: '周日', value: 7 },
];

// ========== 方法 ==========
const handleOk = async () => {
  loading.value = true;
  try {
    // TODO MOCK: 此处应调用更新员工信息的API
    formState.skills = formState.skillList as number[];
    await saveExtendedInfo(formState);
    console.log('Saving employee data:', formState);
    emit('submit');
    handleCancel();
  } catch {
    message.error('更新失败');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  isModalVisible.value = false;
  emit('update:visible', false);
};

const addAvailabilityRow = () => {
  if (!formState.availableTimes) {
    formState.availableTimes = [];
  }
  formState.availableTimes.push({
    key: Date.now(),
    days: [],
    timeRange: ['09:00', '18:00'],
  });
};

const removeAvailabilityRow = (key: number) => {
  const index = formState.availableTimes.findIndex((item) => item.key === key);
  if (index !== -1) {
    formState.availableTimes.splice(index, 1);
  }
};

// ========== 监听 ==========
watch(
  () => props.visible,
  (newValue) => {
    isModalVisible.value = newValue;
    if (newValue) {
      // 深拷贝传入的员工数据，避免直接修改props
      Object.assign(formState, JSON.parse(JSON.stringify(props.employeeData)));
      console.log('formState', formState);
    }
  },
);
onMounted(async () => {
  // TODO: 加载技能列表
  const data = await skillsList({ storeId: props.storeId });
  allSkills.value = data.rows;
});
</script>

<template>
  <a-modal
    v-model:visible="isModalVisible"
    :title="title || `编辑员工属性 - ${formState.name}`"
    width="700px"
    :confirm-loading="loading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form :model="formState" layout="vertical">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="员工姓名">
            <a-input :value="formState.userName" disabled />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="员工职位 (正职/兼职)">
            <a-select v-model:value="formState.type" placeholder="请选择职位">
              <a-select-option value="正职">正职</a-select-option>
              <a-select-option value="兼职">兼职</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="技能 (可多选)">
            <a-select
              v-model:value="formState.skillList"
              mode="multiple"
              placeholder="请选择员工掌握的技能"
              :options="allSkills.map((s) => ({ value: s.id, label: s.name }))"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="优先分数 (越高越优先)">
            <a-input-number
              v-model:value="formState.priority"
              :min="0"
              :max="100"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="可上班时段">
            <div
              v-for="item in formState.availableTimes"
              :key="item.id"
              class="availability-row"
            >
              <a-select
                v-model:value="item.dayOfWeek"
                mode="multiple"
                placeholder="选择星期"
                :options="weekDayOptions"
                style="width: 250px"
              />
              <a-time-range-picker
                v-model:value="item.timeRange"
                format="HH:mm"
                value-format="HH:mm"
                style="margin: 0 8px"
              />
              <a-button
                type="text"
                danger
                @click="removeAvailabilityRow(item.key)"
                v-if="
                  formState.availableTimes &&
                  formState.availableTimes.length > 1
                "
              >
                <template #icon><DeleteOutlined /></template>
              </a-button>
            </div>
            <a-button type="dashed" block @click="addAvailabilityRow">
              <PlusOutlined /> 添加时段规则
            </a-button>
          </a-form-item>
        </a-col>
        <!-- <a-col :span="24">
          <a-form-item label="支援外店 (可多选)">
            <a-select
              v-model:value="formState.supportStoreIds"
              mode="multiple"
              placeholder="选择可支援的其他分店"
              :options="
                allStores
                  .filter((s) => s.id !== formState.storeId)
                  .map((s) => ({ value: s.id, label: s.name }))
              "
            />
          </a-form-item>
        </a-col> -->
      </a-row>
    </a-form>
  </a-modal>
</template>

<style scoped>
.availability-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.ant-form-item {
  margin-bottom: 16px;
}
</style>
