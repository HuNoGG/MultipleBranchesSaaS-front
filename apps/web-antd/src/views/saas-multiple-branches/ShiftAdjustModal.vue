<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { message } from 'ant-design-vue';

import { scheduleModificationsAdd } from '#/api/hrp/scheduleModifications';
// 引入相关API
import { getAvailableSubstitutes } from '#/api/hrp/userProfile';

// ========== Props and Emits ==========
const props = defineProps({
  visible: Boolean,
  modalData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:visible', 'submit']);

// ========== 状态管理 ==========
const isModalVisible = ref(false);
const loading = ref(false);
const activeTab = ref('substitute'); // 'substitute', 'add-temp', 'adjust-draft'

const substituteEmployeeId = ref(null); // 代班员工ID
const availableSubstitutes = ref([]); // 可用代班员工列表

// ========== 计算属性 ==========
const title = computed(() => {
  if (!props.modalData) return '调整班次';
  return props.modalData.isPublished ? '调整已发布班次' : '修改草稿班次';
});

// ========== 方法 ==========
const fetchSubstitutes = async () => {
  if (!props.modalData) return;
  loading.value = true;
  try {
    const params = {
      storeId: props.modalData.storeId,
      scheduleDate: props.modalData.dayKey,
      skillId: props.modalData.shift.skillId,
      originalUserId: props.modalData.shift.userId,
    };
    const res = await getAvailableSubstitutes(params);
    availableSubstitutes.value = res;
    // 模拟数据
  } catch {
    message.error('获取可代班员工列表失败');
  } finally {
    loading.value = false;
  }
};

const handleOk = async () => {
  loading.value = true;
  try {
    if (props.modalData.isPublished) {
      // 如果是已发布状态，进行相应处理
      const { shift, employee, dayKey } = props.modalData;
      let params = {};
      if (activeTab.value === 'substitute') {
        if (!substituteEmployeeId.value) {
          message.warning('请选择一位代班员工');
          return;
        }
        params = {
          scheduleId: shift.id,
          originalUserId: employee.id,
          newUserId: substituteEmployeeId.value,
          changeType: '替班', // '替班'
        };
      }
      await scheduleModificationsAdd(params);
      message.success('班次调整成功');
      emit('submit');
    }

    handleCancel();
  } catch {
    message.error('操作失败');
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
      // 根据是否已发布，设置默认的tab
      activeTab.value = props.modalData?.isPublished
        ? 'substitute'
        : 'adjust-draft';
      if (props.modalData?.isPublished) {
        fetchSubstitutes();
      }
    }
  },
);
</script>

<template>
  <a-modal
    v-model:visible="isModalVisible"
    :title="title"
    :confirm-loading="loading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-spin :spinning="loading">
      <div v-if="modalData">
        <a-descriptions bordered :column="2">
          <a-descriptions-item label="员工">
            {{ modalData.employee.userName }}
          </a-descriptions-item>
          <a-descriptions-item label="日期">
            {{ modalData.date }}
          </a-descriptions-item>
          <a-descriptions-item label="原班次" :span="2">
            {{ modalData.shift.position }} ({{ modalData.shift.timeRange }})
          </a-descriptions-item>
        </a-descriptions>

        <a-tabs v-model:active-key="activeTab" class="mt-4">
          <template v-if="modalData.isPublished">
            <a-tab-pane key="substitute" tab="安排代班">
              <a-form-item label="选择代班员工">
                <a-select
                  v-model:value="substituteEmployeeId"
                  placeholder="请选择可用的员工"
                >
                  <a-select-option
                    v-for="emp in availableSubstitutes"
                    :key="emp.userId"
                    :value="emp.userId"
                  >
                    {{ emp.userName }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-tab-pane>
            <a-tab-pane key="add-temp" tab="新增临时排班">
              <p>此功能将在此班次基础上，额外增加一个临时排班。</p>
            </a-tab-pane>
          </template>
          <template v-else>
            <a-tab-pane key="adjust-draft" tab="修改班次">
              <p>在这里放置修改草稿班次的表单...</p>
              <!-- <a-button danger>清空此班次</a-button> -->
            </a-tab-pane>
          </template>
        </a-tabs>
      </div>
    </a-spin>
  </a-modal>
</template>

<style scoped>
.mt-4 {
  margin-top: 16px;
}
</style>
