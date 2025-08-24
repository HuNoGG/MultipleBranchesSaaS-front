<script setup lang="ts">
import type { Dayjs } from 'dayjs';

import { onMounted, reactive, ref, watch } from 'vue';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

// 假设有创建排班修改的API
import { scheduleModificationsAddBatch } from '#/api/hrp/scheduleModifications';

import { skillsList } from '../hrp/skills';

// ========== 数据模型定义 ==========
interface Employee {
  id: number;
  name: string;
}
interface WeekDay {
  key: string;
  label: string;
}
interface SupplementFormItem {
  key: number;
  dayKey?: string;
  personType: 'external' | 'internal';
  employeeId?: number;
  employeeName?: string;
  tag?: string;
  timeRange?: [Dayjs, Dayjs];
  position?: string;
}

// ========== Props and Emits ==========
const props = defineProps({
  visible: Boolean,
  storeId: {
    type: Number,
    required: true,
  },
  employees: {
    type: Array as () => Employee[],
    default: () => [],
  },
  weekDays: {
    type: Array as () => WeekDay[],
    default: () => [],
  },
});

const emit = defineEmits(['update:visible', 'submit']);

// ========== 状态管理 ==========
const isModalVisible = ref(false);
const loading = ref(false);
const form = reactive<{ items: SupplementFormItem[] }>({
  items: [],
});

// ========== 方法 ==========
const addSupplementRow = () => {
  form.items.push({
    key: Date.now(),
    dayKey: props.weekDays[0]?.key,
    personType: 'internal',
  });
};

const removeSupplementRow = (itemKey: number) => {
  const index = form.items.findIndex((item) => item.key === itemKey);
  if (index !== -1) {
    form.items.splice(index, 1);
  }
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    const requests: any[] = [];
    form.items.forEach((item) => {
      // 校验表单
      if (
        !item.dayKey ||
        (!item.employeeId && !item.employeeName) ||
        !item.timeRange ||
        !item.position
      ) {
        throw new Error('请填写所有必填项');
      }
      const payload = {
        storeId: props.storeId,
        scheduleDate: item.dayKey,
        newUserId: item.personType === 'internal' ? item.employeeId : 0, // 外部人员可设为0
        changeType: '新增临时',
        remark: JSON.stringify({
          employeeName:
            item.personType === 'external'
              ? item.employeeName
              : props.employees.find((e) => e.id === item.employeeId)?.name,
          tag: item.tag,
          timeRange: item.timeRange.map((t) => t.format('HH:mm')),
          position: item.position,
        }),
      };
      requests.push(payload);
    });

    // 实际调用API
    await scheduleModificationsAddBatch(requests);
    console.log('Submitting payload:', requests);
    message.success('增补人员成功！');
    emit('submit'); // 通知父组件刷新
    handleCancel();
  } catch (error: any) {
    message.error(error.message || '增补失败，请检查数据');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  isModalVisible.value = false;
  emit('update:visible', false);
};

// ========== 监听 ==========
watch(
  () => props.visible,
  (newValue) => {
    isModalVisible.value = newValue;
    if (newValue) {
      // 每次打开弹窗时，都初始化为一条记录
      form.items = [
        {
          key: Date.now(),
          dayKey: props.weekDays[0]?.key,
          personType: 'internal',
          employeeId: undefined,
          employeeName: '',
          tag: '',
          timeRange: undefined,
          position: '',
        },
      ];
    }
  },
);
const allSkills = ref<{ id: number; name: string }[]>([]);
onMounted(async () => {
  // 获取岗位数据
  const skills = await skillsList();
  allSkills.value = skills.rows;
});
</script>

<template>
  <a-modal
    v-model:visible="isModalVisible"
    title="增补排班"
    width="700px"
    :confirm-loading="loading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form layout="vertical">
      <div
        v-for="(item, index) in form.items"
        :key="item.key"
        class="supplement-row"
      >
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="选择日期" required>
              <a-select
                v-model:value="item.dayKey"
                :options="
                  weekDays.map((d) => ({ value: d.key, label: d.label }))
                "
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="员工姓名" required>
              <a-radio-group
                v-model:value="item.personType"
                size="small"
                style="margin-bottom: 4px"
              >
                <a-radio value="internal">内部</a-radio>
                <a-radio value="external">外部</a-radio>
              </a-radio-group>
              <a-select
                v-if="item.personType === 'internal'"
                v-model:value="item.employeeId"
                placeholder="请选择内部员工"
                :options="
                  employees.map((e) => ({ value: e.id, label: e.name }))
                "
                style="width: 100%"
                show-search
              />
              <a-input
                v-else
                v-model:value="item.employeeName"
                placeholder="请输入外部人员姓名"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="班次时间" required>
              <a-time-range-picker
                v-model:value="item.timeRange"
                format="HH:mm"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="岗位" required>
              <a-select
                v-model:value="item.position"
                size="small"
                style="width: 100px"
                placeholder="岗位"
              >
                <a-select-option
                  v-for="skill in allSkills"
                  :key="skill.id"
                  :value="skill.id"
                >
                  {{ skill.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="标签 (例如: 体验工)">
              <a-input v-model:value="item.tag" placeholder="请输入标签" />
            </a-form-item>
          </a-col>
          <a-col
            :span="2"
            style="display: flex; align-items: center; margin-top: 8px"
          >
            <a-button
              type="text"
              danger
              @click="removeSupplementRow(item.key)"
              v-if="form.items.length > 1"
            >
              <template #icon><DeleteOutlined /></template>
            </a-button>
          </a-col>
        </a-row>
        <a-divider v-if="index < form.items.length - 1" />
      </div>
    </a-form>
    <a-button type="dashed" block @click="addSupplementRow">
      <template #icon><PlusOutlined /></template>
      添加另一条增补记录
    </a-button>
  </a-modal>
</template>

<style scoped>
.supplement-row {
  margin-bottom: 8px;
}

.ant-form-item {
  margin-bottom: 12px;
}
</style>
