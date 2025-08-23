<!--
使用antd原生Form生成 详细用法参考ant-design-vue Form组件文档
vscode默认配置文件会自动格式化/移除未使用依赖
-->
<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form';

import type { AttendanceRecordsForm } from '#/api/hrp/attendanceRecords/model';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import { DatePicker, Form, FormItem, Input } from 'ant-design-vue';
import { pick } from 'lodash-es';

import {
  attendanceRecordsAdd,
  attendanceRecordsInfo,
  attendanceRecordsUpdate,
} from '#/api/hrp/attendanceRecords';
import { useBeforeCloseDiff } from '#/utils/popup';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

/**
 * 定义默认值 用于reset
 */
const defaultValues: Partial<AttendanceRecordsForm> = {
  id: undefined,
  userId: undefined,
  scheduleId: undefined,
  clockInTime: undefined,
  clockOutTime: undefined,
  recordDate: undefined,
};

/**
 * 表单数据ref
 */
const formData = ref(defaultValues);

type AntdFormRules<T> = Partial<Record<keyof T, RuleObject[]>> & {
  [key: string]: RuleObject[];
};
/**
 * 表单校验规则
 */
const formRules = ref<AntdFormRules<AttendanceRecordsForm>>({
  userId: [{ required: true, message: '员工 ID不能为空' }],
  scheduleId: [{ required: true, message: '关联的排班记录ID不能为空' }],
  clockInTime: [{ required: true, message: '上班打卡时间不能为空' }],
  clockOutTime: [{ required: true, message: '下班打卡时间不能为空' }],
  recordDate: [{ required: true, message: '记录日期不能为空' }],
});

/**
 * useForm解构出表单方法
 */
const { validate, validateInfos, resetFields } = Form.useForm(
  formData,
  formRules,
);

function customFormValueGetter() {
  return JSON.stringify(formData.value);
}

const { onBeforeClose, markInitialized, resetInitialized } = useBeforeCloseDiff(
  {
    initializedGetter: customFormValueGetter,
    currentGetter: customFormValueGetter,
  },
);

const [BasicModal, modalApi] = useVbenModal({
  class: 'w-[550px]',
  fullscreenButton: false,
  onBeforeClose,
  onClosed: handleClosed,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) {
      return null;
    }
    modalApi.modalLoading(true);

    const { id } = modalApi.getData() as { id?: number | string };
    isUpdate.value = !!id;

    if (isUpdate.value && id) {
      const record = await attendanceRecordsInfo(id);
      // 只赋值存在的字段
      const filterRecord = pick(record, Object.keys(defaultValues));
      formData.value = filterRecord;
    }
    await markInitialized();

    modalApi.modalLoading(false);
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    await validate();
    // 可能会做数据处理 使用cloneDeep深拷贝
    const data = cloneDeep(formData.value);
    await (isUpdate.value
      ? attendanceRecordsUpdate(data)
      : attendanceRecordsAdd(data));
    resetInitialized();
    emit('reload');
    modalApi.close();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.lock(false);
  }
}

async function handleClosed() {
  formData.value = defaultValues;
  resetFields();
  resetInitialized();
}
</script>

<template>
  <BasicModal :title="title">
    <Form :label-col="{ span: 4 }">
      <FormItem label="员工 ID" v-bind="validateInfos.userId">
        <Input
          v-model:value="formData.userId"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="关联的排班记录ID" v-bind="validateInfos.scheduleId">
        <Input
          v-model:value="formData.scheduleId"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="上班打卡时间" v-bind="validateInfos.clockInTime">
        <!-- 需要自行调整参数 -->
        <DatePicker
          v-model:value="formData.clockInTime"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </FormItem>
      <FormItem label="下班打卡时间" v-bind="validateInfos.clockOutTime">
        <!-- 需要自行调整参数 -->
        <DatePicker
          v-model:value="formData.clockOutTime"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </FormItem>
      <FormItem label="记录日期" v-bind="validateInfos.recordDate">
        <!-- 需要自行调整参数 -->
        <DatePicker
          v-model:value="formData.recordDate"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </FormItem>
    </Form>
  </BasicModal>
</template>
