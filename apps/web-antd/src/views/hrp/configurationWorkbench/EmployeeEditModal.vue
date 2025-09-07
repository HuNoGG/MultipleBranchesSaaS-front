<script setup lang="ts">
import type { Availability } from '#/api/hrp/userAvailability/model';
import type { UserSkillsForm } from '#/api/hrp/userSkills/model.d.ts';

import { reactive, ref, watch } from 'vue';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

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
  employeeType: string;
  userSkills: UserSkillsForm[]; // 修改
  availableTimes: Availability[];
  supportStoreIds: number[];
  storeId: number;
  restDays?: number[]; // 新增
}

// ========== Props and Emits ==========
const props = defineProps({
  visible: Boolean,
  employeeData: {
    type: Object as () => Employee,
    required: true,
  },
  allSkills: {
    type: Array as () => Skill[],
    default: () => [],
  },
  allStores: {
    type: Array as () => Store[],
    default: () => [],
  },
});

const emit = defineEmits(['update:visible', 'submit']);

// ========== 状态管理 ==========
const isModalVisible = ref(false);
const loading = ref(false);
const formState = reactive<Partial<Employee>>({});
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
    if (formState.availableTimes) {
      formState.availableTimes.forEach((item: any) => {
        if (item.timeRange) {
          item.startTime = item.timeRange[0];
          item.endTime = item.timeRange[1];
        }
      });
    }
    if (formState.userSkills) {
      formState.userSkills.forEach(skill => {
        skill.userId = formState.id;
      });
    }
    formState.skills  = formState.userSkills
    await saveExtendedInfo(formState);
    message.success(`员工 ${formState.userName} 的信息已更新`);
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
    dayOfWeek: undefined,
    startTime: '09:00:00',
    endTime: '18:00:00',
    timeRange: ['09:00:00', '18:00:00'],
  });
};

const removeAvailabilityRow = (key: number) => {
  if (formState.availableTimes) {
    const index = formState.availableTimes.findIndex((item) => item.key === key);
    if (index !== -1) {
      formState.availableTimes.splice(index, 1);
    }
  }
};

const addSkillRow = () => {
  if (!formState.userSkills) {
    formState.userSkills = [];
  }
  formState.userSkills.push({
    key: Date.now(),
    skillId: undefined,
    priority: 0,
  });
};

const removeSkillRow = (key: number) => {
  const index = formState.userSkills.findIndex((item) => item.key === key);
  if (index !== -1) {
    formState.userSkills.splice(index, 1);
  }
};

// ========== 监听 ==========
watch(
  () => props.visible,
  (newValue) => {
    isModalVisible.value = newValue;
    if (newValue) {
      const employeeData = JSON.parse(JSON.stringify(props.employeeData));
      Object.assign(formState, employeeData);
      if (!formState.userSkills) {
        formState.userSkills = [];
      }
      if (!formState.restDays) {
        formState.restDays = [];
      }
      if(formState.availableTimes){

        formState.availableTimes.forEach((s)=>{
          s.timeRange = [s.startTime,s.endTime]
        })
      }
    }
  },
);
</script>

<template>
  <a-modal
    v-model:visible="isModalVisible"
    :title="`编辑员工属性 - ${formState.userName}`"
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
            <a-select v-model:value="formState.employeeType" placeholder="请选择职位">
              <a-select-option value="正职">正职</a-select-option>
              <a-select-option value="兼职">兼职</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :span="24">
          <a-form-item label="休息日 (可多选)">
            <a-checkbox-group v-model:value="formState.restDays" :options="weekDayOptions" />
          </a-form-item>
        </a-col>

        <a-col :span="24">
          <a-form-item label="技能和分数">
            <div v-for="skill in formState.userSkills" :key="skill.key" class="skill-row">
              <a-select
                v-model:value="skill.skillId"
                placeholder="选择技能"
                style="width: 200px"
                :options="allSkills.map((s) => ({ value: s.id, label: s.name }))"
              />
              <a-input-number
                v-model:value="skill.priority"
                placeholder="分数"
                :min="0"
                :max="100"
                style="margin: 0 8px"
              />
              <a-button type="text" danger @click="removeSkillRow(skill.key)">
                <template #icon><DeleteOutlined /></template>
              </a-button>
            </div>
            <a-button type="dashed" block @click="addSkillRow">
              <PlusOutlined /> 添加技能
            </a-button>
          </a-form-item>
        </a-col>

        <a-col :span="24">
          <a-form-item label="可上班时段">
            <div v-for="item in formState.availableTimes" :key="item.key || item.id" class="availability-row">
              <a-select
                v-model:value="item.dayOfWeek"
                placeholder="选择星期"
                :options="weekDayOptions"
                style="width: 250px"
              />
              <a-time-range-picker
                v-model:value="item.timeRange"
                format="HH:mm"
                value-format="HH:mm:ss"
                style="margin: 0 8px"
              />
              <a-button
                type="text"
                danger
                @click="removeAvailabilityRow(item.key)"
                v-if="formState.availableTimes && formState.availableTimes.length > 1"
              >
                <template #icon><DeleteOutlined /></template>
              </a-button>
            </div>
            <a-button type="dashed" style="width: calc(50% - 4px); margin-right: 8px;" block @click="addAvailabilityRow">
              <PlusOutlined /> 添加时段规则
            </a-button>
            <a-button danger block style="width: 50%;" @click="formState.availableTimes = []">
              <DeleteOutlined /> 一键清空
            </a-button>
          </a-form-item>
        </a-col>

        <a-col :span="24">
          <a-form-item label="支援外店 (可多选)">
            <a-select
              v-model:value="formState.supportStoreIds"
              mode="multiple"
              placeholder="选择可支援的其他分店"
              :options="allStores.filter((s) => s.id !== formState.storeId).map((s) => ({ value: s.id, label: s.name }))"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<style scoped>
.skill-row,
.availability-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.ant-form-item {
  margin-bottom: 16px;
}
</style>
