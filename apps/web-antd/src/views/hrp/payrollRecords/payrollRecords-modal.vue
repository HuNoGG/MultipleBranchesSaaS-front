<!--
使用antd原生Form生成 详细用法参考ant-design-vue Form组件文档
vscode默认配置文件会自动格式化/移除未使用依赖
-->
<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form';

import type { PayrollRecordsForm } from '#/api/hrp/payrollRecords/model';

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

import {
  payrollRecordsAdd,
  payrollRecordsInfo,
  payrollRecordsUpdate,
} from '#/api/hrp/payrollRecords';
import { useBeforeCloseDiff } from '#/utils/popup';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

/**
 * 定义默认值 用于reset
 */
const defaultValues: Partial<PayrollRecordsForm> = {
  id: undefined,
  userId: undefined,
  payPeriodStart: undefined,
  payPeriodEnd: undefined,
  totalHours: undefined,
  basePay: undefined,
  overtimePay: undefined,
  deductions: undefined,
  finalSalary: undefined,
  isFinalized: undefined,
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
const formRules = ref<AntdFormRules<PayrollRecordsForm>>({
  userId: [{ required: true, message: '员工 ID不能为空' }],
  payPeriodStart: [{ required: true, message: '薪资周期开始不能为空' }],
  payPeriodEnd: [{ required: true, message: '薪资周期结束不能为空' }],
  totalHours: [{ required: true, message: '总工时不能为空' }],
  basePay: [{ required: true, message: '基本薪资不能为空' }],
  overtimePay: [{ required: true, message: '加班费不能为空' }],
  deductions: [{ required: true, message: '扣款不能为空' }],
  finalSalary: [{ required: true, message: '最终薪资不能为空' }],
  isFinalized: [
    { required: true, message: '是否已确认(TRUE =是,FALSE = 否)不能为空' },
  ],
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
      const record = await payrollRecordsInfo(id);
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
      ? payrollRecordsUpdate(data)
      : payrollRecordsAdd(data));
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
      <FormItem label="薪资周期开始" v-bind="validateInfos.payPeriodStart">
        <!-- 需要自行调整参数 -->
        <DatePicker
          v-model:value="formData.payPeriodStart"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </FormItem>
      <FormItem label="薪资周期结束" v-bind="validateInfos.payPeriodEnd">
        <!-- 需要自行调整参数 -->
        <DatePicker
          v-model:value="formData.payPeriodEnd"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </FormItem>
      <FormItem label="总工时" v-bind="validateInfos.totalHours">
        <Input
          v-model:value="formData.totalHours"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="基本薪资" v-bind="validateInfos.basePay">
        <Input
          v-model:value="formData.basePay"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="加班费" v-bind="validateInfos.overtimePay">
        <Input
          v-model:value="formData.overtimePay"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="扣款" v-bind="validateInfos.deductions">
        <Input
          v-model:value="formData.deductions"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="最终薪资" v-bind="validateInfos.finalSalary">
        <Input
          v-model:value="formData.finalSalary"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem
        label="是否已确认(TRUE =是,FALSE = 否)"
        v-bind="validateInfos.isFinalized"
      >
        <Input
          v-model:value="formData.isFinalized"
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
