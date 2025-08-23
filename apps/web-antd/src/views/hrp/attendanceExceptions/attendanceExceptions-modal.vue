<!--
使用antd原生Form生成 详细用法参考ant-design-vue Form组件文档
vscode默认配置文件会自动格式化/移除未使用依赖
-->
<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form';

import type { AttendanceExceptionsForm } from '#/api/hrp/attendanceExceptions/model';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep, getPopupContainer } from '@vben/utils';

import {
  DatePicker,
  Form,
  FormItem,
  Input,
  RadioGroup,
  Select,
  Textarea,
} from 'ant-design-vue';
import { pick } from 'lodash-es';

import {
  attendanceExceptionsAdd,
  attendanceExceptionsInfo,
  attendanceExceptionsUpdate,
} from '#/api/hrp/attendanceExceptions';
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
const defaultValues: Partial<AttendanceExceptionsForm> = {
  id: undefined,
  userId: undefined,
  exceptionDate: undefined,
  exceptionType: undefined,
  originalClockIn: undefined,
  originalClockOut: undefined,
  correctedClockIn: undefined,
  correctedClockOut: undefined,
  approvalStatus: undefined,
  approvedBy: undefined,
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
const formRules = ref<AntdFormRules<AttendanceExceptionsForm>>({
  userId: [{ required: true, message: '员工 ID不能为空' }],
  exceptionType: [
    {
      required: true,
      message: '异常类型(字典: 忘记打卡, 迟到未请假, 早退未请假, 缺勤)不能为空',
    },
  ],
  originalClockIn: [{ required: true, message: '原始打卡(上班)不能为空' }],
  originalClockOut: [{ required: true, message: '原始打卡(下班)不能为空' }],
  correctedClockIn: [{ required: true, message: '修正后打卡(上班)不能为空' }],
  correctedClockOut: [{ required: true, message: '修正后打卡(下班)不能为空' }],
  approvalStatus: [
    { required: true, message: '状态(字典: 待处理, 已修正)不能为空' },
  ],
  approvedBy: [{ required: true, message: '审核人 ID不能为空' }],
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
      const record = await attendanceExceptionsInfo(id);
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
      ? attendanceExceptionsUpdate(data)
      : attendanceExceptionsAdd(data));
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
      <FormItem label="异常日期" v-bind="validateInfos.exceptionDate">
        <!-- 需要自行调整参数 -->
        <DatePicker
          v-model:value="formData.exceptionDate"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </FormItem>
      <FormItem
        label="异常类型(字典: 忘记打卡, 迟到未请假, 早退未请假, 缺勤)"
        v-bind="validateInfos.exceptionType"
      >
        <Select
          v-model:value="formData.exceptionType"
          :options="getDictOptions('hrp_attendance_exception_type')"
          :get-popup-container="getPopupContainer"
          :placeholder="$t('ui.formRules.selectRequired')"
        />
      </FormItem>
      <FormItem label="原始打卡(上班)" v-bind="validateInfos.originalClockIn">
        <!-- 需要自行调整参数 -->
        <DatePicker
          v-model:value="formData.originalClockIn"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </FormItem>
      <FormItem label="原始打卡(下班)" v-bind="validateInfos.originalClockOut">
        <!-- 需要自行调整参数 -->
        <DatePicker
          v-model:value="formData.originalClockOut"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </FormItem>
      <FormItem
        label="修正后打卡(上班)"
        v-bind="validateInfos.correctedClockIn"
      >
        <!-- 需要自行调整参数 -->
        <DatePicker
          v-model:value="formData.correctedClockIn"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </FormItem>
      <FormItem
        label="修正后打卡(下班)"
        v-bind="validateInfos.correctedClockOut"
      >
        <!-- 需要自行调整参数 -->
        <DatePicker
          v-model:value="formData.correctedClockOut"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </FormItem>
      <FormItem
        label="状态(字典: 待处理, 已修正)"
        v-bind="validateInfos.approvalStatus"
      >
        <RadioGroup
          option-type="button"
          button-style="solid"
          v-model:value="formData.approvalStatus"
          :options="getDictOptions('hrp_attendance_approval_status')"
        />
      </FormItem>
      <FormItem label="审核人 ID" v-bind="validateInfos.approvedBy">
        <Input
          v-model:value="formData.approvedBy"
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
