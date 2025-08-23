<!--
使用antd原生Form生成 详细用法参考ant-design-vue Form组件文档
vscode默认配置文件会自动格式化/移除未使用依赖
-->
<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form';

import type { ShiftsForm } from '#/api/hrp/shifts/model';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import {
  DatePicker,
  Form,
  FormItem,
  Input,
  RadioGroup,
  Textarea,
} from 'ant-design-vue';
import { pick } from 'lodash-es';

import { shiftsAdd, shiftsInfo, shiftsUpdate } from '#/api/hrp/shifts';
import { useBeforeCloseDiff } from '#/utils/popup';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

/**
 * 定义默认值 用于reset
 */
const defaultValues: Partial<ShiftsForm> = {
  id: undefined,
  storeId: undefined,
  name: undefined,
  code: undefined,
  startTime: undefined,
  endTime: undefined,
  isCrossDay: undefined,
  colorCode: undefined,
  status: undefined,
  remark: undefined,
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
const formRules = ref<AntdFormRules<ShiftsForm>>({
  storeId: [{ required: true, message: '所属分店 ID不能为空' }],
  code: [{ required: true, message: '班别代码(如:早)不能为空' }],
  isCrossDay: [
    { required: true, message: '是否跨日(TRUE =是,FALSE =否)不能为空' },
  ],
  colorCode: [{ required: true, message: '班表显示颜色(如:#FF5733)不能为空' }],
  status: [{ required: true, message: '状态(0正常1停用)不能为空' }],
  remark: [{ required: true, message: '备注不能为空' }],
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
      const record = await shiftsInfo(id);
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
    await (isUpdate.value ? shiftsUpdate(data) : shiftsAdd(data));
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
      <FormItem label="所属分店 ID" v-bind="validateInfos.storeId">
        <Input
          v-model:value="formData.storeId"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="班别名称(如:早班)" v-bind="validateInfos.name">
        <Input
          v-model:value="formData.name"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="班别代码(如:早)" v-bind="validateInfos.code">
        <Input
          v-model:value="formData.code"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="开始时间" v-bind="validateInfos.startTime">
        <!-- 需要自行调整参数 -->
        <DatePicker
          v-model:value="formData.startTime"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </FormItem>
      <FormItem label="结束时间" v-bind="validateInfos.endTime">
        <!-- 需要自行调整参数 -->
        <DatePicker
          v-model:value="formData.endTime"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </FormItem>
      <FormItem
        label="是否跨日(TRUE =是,FALSE =否)"
        v-bind="validateInfos.isCrossDay"
      >
        <Input
          v-model:value="formData.isCrossDay"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem
        label="班表显示颜色(如:#FF5733)"
        v-bind="validateInfos.colorCode"
      >
        <Input
          v-model:value="formData.colorCode"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="状态(0正常1停用)" v-bind="validateInfos.status">
        <RadioGroup
          option-type="button"
          button-style="solid"
          v-model:value="formData.status"
          :options="[]"
        />
      </FormItem>
      <FormItem label="备注" v-bind="validateInfos.remark">
        <Textarea
          v-model:value="formData.remark"
          :placeholder="$t('ui.formRules.required')"
          :rows="4"
        />
      </FormItem>
    </Form>
  </BasicModal>
</template>
