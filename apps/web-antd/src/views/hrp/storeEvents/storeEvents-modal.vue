<!--
使用antd原生Form生成 详细用法参考ant-design-vue Form组件文档
vscode默认配置文件会自动格式化/移除未使用依赖
-->
<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form';

import type { StoreEventsForm } from '#/api/hrp/storeEvents/model';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep, getPopupContainer } from '@vben/utils';

import { DatePicker, Form, FormItem, Input, Select } from 'ant-design-vue';
import { pick } from 'lodash-es';

import {
  storeEventsAdd,
  storeEventsInfo,
  storeEventsUpdate,
} from '#/api/hrp/storeEvents';
import { getDictOptions } from '#/utils/dict';
import { useBeforeCloseDiff } from '#/utils/popup';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

/**
 * 定义默认值 用于reset
 */
const defaultValues: Partial<StoreEventsForm> = {
  id: undefined,
  storeId: undefined,
  eventDate: undefined,
  eventType: undefined,
  description: undefined,
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
const formRules = ref<AntdFormRules<StoreEventsForm>>({
  storeId: [{ required: true, message: '分店 ID (关联分店表)不能为空' }],
  eventType: [
    {
      required: true,
      message: '事件类型(字典: 全天放假, 上午放假, 下午放假)不能为空',
    },
  ],
  description: [
    {
      required: true,
      message: '事件描述(如:法定节假日放假、设备检修)不能为空',
    },
  ],
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
      const record = await storeEventsInfo(id);
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
    await (isUpdate.value ? storeEventsUpdate(data) : storeEventsAdd(data));
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
      <FormItem label="分店 ID (关联分店表)" v-bind="validateInfos.storeId">
        <Input
          v-model:value="formData.storeId"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="事件日期" v-bind="validateInfos.eventDate">
        <!-- 需要自行调整参数 -->
        <DatePicker
          v-model:value="formData.eventDate"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </FormItem>
      <FormItem
        label="事件类型(字典: 全天放假, 上午放假, 下午放假)"
        v-bind="validateInfos.eventType"
      >
        <Select
          v-model:value="formData.eventType"
          :options="getDictOptions('hrp_store_event_type')"
          :get-popup-container="getPopupContainer"
          :placeholder="$t('ui.formRules.selectRequired')"
        />
      </FormItem>
      <FormItem
        label="事件描述(如:法定节假日放假、设备检修)"
        v-bind="validateInfos.description"
      >
        <Input
          v-model:value="formData.description"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
    </Form>
  </BasicModal>
</template>
