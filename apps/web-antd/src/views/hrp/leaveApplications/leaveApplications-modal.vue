<!--
使用antd原生Form生成 详细用法参考ant-design-vue Form组件文档
vscode默认配置文件会自动格式化/移除未使用依赖
-->
<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form';

import type { LeaveApplicationsForm } from '#/api/hrp/leaveApplications/model';

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
  leaveApplicationsAdd,
  leaveApplicationsInfo,
  leaveApplicationsUpdate,
} from '#/api/hrp/leaveApplications';
import { useBeforeCloseDiff } from '#/utils/popup';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

/**
 * 定义默认值 用于reset
 */
const defaultValues: Partial<LeaveApplicationsForm> = {
  id: undefined,
  userId: undefined,
  leaveType: undefined,
  startTime: undefined,
  endTime: undefined,
  leaveDays: undefined,
  reason: undefined,
  attachmentUrl: undefined,
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
const formRules = ref<AntdFormRules<LeaveApplicationsForm>>({
  userId: [{ required: true, message: '申请人ID(关联系统用户表)不能为空' }],
  leaveType: [
    { required: true, message: '请假类型(如:事假,病假,年假,婚假)不能为空' },
  ],
  leaveDays: [
    { required: true, message: '请假天数(自动计算,支持0.5天粒度)不能为空' },
  ],
  reason: [{ required: true, message: '请假事由不能为空' }],
  attachmentUrl: [
    { required: true, message: '附件链接(如病假证明、休假凭证)不能为空' },
  ],
  approvalStatus: [
    {
      required: true,
      message: '审批状态(字典: 待审批, 已批准, 已驳回)不能为空',
    },
  ],
  approvedBy: [
    { required: true, message: '审批人ID(关联系统用户表,审批后生效)不能为空' },
  ],
  status: [{ required: true, message: '数据状态(0正常1停用/作废)不能为空' }],
  remark: [{ required: true, message: '备注(如审批意见、特殊说明)不能为空' }],
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
      const record = await leaveApplicationsInfo(id);
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
      ? leaveApplicationsUpdate(data)
      : leaveApplicationsAdd(data));
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
      <FormItem label="申请人ID(关联系统用户表)" v-bind="validateInfos.userId">
        <Input
          v-model:value="formData.userId"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem
        label="请假类型(如:事假,病假,年假,婚假)"
        v-bind="validateInfos.leaveType"
      >
        <Select
          v-model:value="formData.leaveType"
          :options="[]"
          :get-popup-container="getPopupContainer"
          :placeholder="$t('ui.formRules.selectRequired')"
        />
      </FormItem>
      <FormItem
        label="请假开始时间(精确到时分)"
        v-bind="validateInfos.startTime"
      >
        <!-- 需要自行调整参数 -->
        <DatePicker
          v-model:value="formData.startTime"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </FormItem>
      <FormItem label="请假结束时间(精确到时分)" v-bind="validateInfos.endTime">
        <!-- 需要自行调整参数 -->
        <DatePicker
          v-model:value="formData.endTime"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </FormItem>
      <FormItem
        label="请假天数(自动计算,支持0.5天粒度)"
        v-bind="validateInfos.leaveDays"
      >
        <Input
          v-model:value="formData.leaveDays"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="请假事由" v-bind="validateInfos.reason">
        <Textarea
          v-model:value="formData.reason"
          :placeholder="$t('ui.formRules.required')"
          :rows="4"
        />
      </FormItem>
      <FormItem
        label="附件链接(如病假证明、休假凭证)"
        v-bind="validateInfos.attachmentUrl"
      >
        <Input
          v-model:value="formData.attachmentUrl"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem
        label="审批状态(字典: 待审批, 已批准, 已驳回)"
        v-bind="validateInfos.approvalStatus"
      >
        <RadioGroup
          option-type="button"
          button-style="solid"
          v-model:value="formData.approvalStatus"
          :options="[]"
        />
      </FormItem>
      <FormItem
        label="审批人ID(关联系统用户表,审批后生效)"
        v-bind="validateInfos.approvedBy"
      >
        <Input
          v-model:value="formData.approvedBy"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="数据状态(0正常1停用/作废)" v-bind="validateInfos.status">
        <RadioGroup
          option-type="button"
          button-style="solid"
          v-model:value="formData.status"
          :options="[]"
        />
      </FormItem>
      <FormItem
        label="备注(如审批意见、特殊说明)"
        v-bind="validateInfos.remark"
      >
        <Textarea
          v-model:value="formData.remark"
          :placeholder="$t('ui.formRules.required')"
          :rows="4"
        />
      </FormItem>
    </Form>
  </BasicModal>
</template>
