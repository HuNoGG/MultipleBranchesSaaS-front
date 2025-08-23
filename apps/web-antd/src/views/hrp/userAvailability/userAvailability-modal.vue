<!--
使用antd原生Form生成 详细用法参考ant-design-vue Form组件文档
vscode默认配置文件会自动格式化/移除未使用依赖
-->
<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form';

import type { UserAvailabilityForm } from '#/api/hrp/userAvailability/model';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import { DatePicker, Form, FormItem, Input } from 'ant-design-vue';
import { pick } from 'lodash-es';

import {
  userAvailabilityAdd,
  userAvailabilityInfo,
  userAvailabilityUpdate,
} from '#/api/hrp/userAvailability';
import { useBeforeCloseDiff } from '#/utils/popup';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

/**
 * 定义默认值 用于reset
 */
const defaultValues: Partial<UserAvailabilityForm> = {
  id: undefined,
  userId: undefined,
  dayOfWeek: undefined,
  startTime: undefined,
  endTime: undefined,
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
const formRules = ref<AntdFormRules<UserAvailabilityForm>>({
  userId: [{ required: true, message: '员工 ID不能为空' }],
  dayOfWeek: [
    { required: true, message: '星期几 (1=周一, 2=周二, ..., 7=周日)不能为空' },
  ],
  startTime: [{ required: true, message: '可上班的开始时间不能为空' }],
  endTime: [{ required: true, message: '可上班的结束时间不能为空' }],
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
      const record = await userAvailabilityInfo(id);
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
      ? userAvailabilityUpdate(data)
      : userAvailabilityAdd(data));
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
      <FormItem
        label="星期几 (1=周一, 2=周二, ..., 7=周日)"
        v-bind="validateInfos.dayOfWeek"
      >
        <Input
          v-model:value="formData.dayOfWeek"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="可上班的开始时间" v-bind="validateInfos.startTime">
        <!-- 需要自行调整参数 -->
        <DatePicker
          v-model:value="formData.startTime"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </FormItem>
      <FormItem label="可上班的结束时间" v-bind="validateInfos.endTime">
        <!-- 需要自行调整参数 -->
        <DatePicker
          v-model:value="formData.endTime"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </FormItem>
    </Form>
  </BasicModal>
</template>
