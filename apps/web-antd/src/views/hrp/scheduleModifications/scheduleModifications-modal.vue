<!--
使用antd原生Form生成 详细用法参考ant-design-vue Form组件文档
vscode默认配置文件会自动格式化/移除未使用依赖
-->
<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form';

import type { ScheduleModificationsForm } from '#/api/hrp/scheduleModifications/model';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep, getPopupContainer } from '@vben/utils';

import {
  DatePicker,
  Form,
  FormItem,
  Input,
  Select,
  Textarea,
} from 'ant-design-vue';
import { pick } from 'lodash-es';

import {
  scheduleModificationsAdd,
  scheduleModificationsInfo,
  scheduleModificationsUpdate,
} from '#/api/hrp/scheduleModifications';
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
const defaultValues: Partial<ScheduleModificationsForm> = {
  id: undefined,
  scheduleId: undefined,
  originalUserId: undefined,
  newUserId: undefined,
  changeType: undefined,
  changedBy: undefined,
  changeTime: undefined,
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
const formRules = ref<AntdFormRules<ScheduleModificationsForm>>({
  scheduleId: [
    { required: true, message: '关联的排班记录ID(原排班表主键)不能为空' },
  ],
  originalUserId: [
    { required: true, message: '原员工ID(修改前的排班员工)不能为空' },
  ],
  newUserId: [
    {
      required: true,
      message: "新员工ID(修改后的排班员工,change_type为'新增临时')不能为空",
    },
  ],
  changeType: [
    { required: true, message: '修改类型(字典: 调班, 替班, 新增临时)不能为空' },
  ],
  changedBy: [{ required: true, message: '修改人ID(操作修改的用户)不能为空' }],
  changeTime: [{ required: true, message: '修改时间不能为空' }],
  remark: [
    { required: true, message: '备注(如:调班原因、替班说明等)不能为空' },
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
      const record = await scheduleModificationsInfo(id);
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
      ? scheduleModificationsUpdate(data)
      : scheduleModificationsAdd(data));
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
      <FormItem
        label="关联的排班记录ID(原排班表主键)"
        v-bind="validateInfos.scheduleId"
      >
        <Input
          v-model:value="formData.scheduleId"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem
        label="原员工ID(修改前的排班员工)"
        v-bind="validateInfos.originalUserId"
      >
        <Input
          v-model:value="formData.originalUserId"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem
        label="新员工ID(修改后的排班员工,change_type为'新增临时')"
        v-bind="validateInfos.newUserId"
      >
        <Input
          v-model:value="formData.newUserId"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem
        label="修改类型(字典: 调班, 替班, 新增临时)"
        v-bind="validateInfos.changeType"
      >
        <Select
          v-model:value="formData.changeType"
          :options="getDictOptions('hrp_schedule_change_type')"
          :get-popup-container="getPopupContainer"
          :placeholder="$t('ui.formRules.selectRequired')"
        />
      </FormItem>
      <FormItem
        label="修改人ID(操作修改的用户)"
        v-bind="validateInfos.changedBy"
      >
        <Input
          v-model:value="formData.changedBy"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="修改时间" v-bind="validateInfos.changeTime">
        <!-- 需要自行调整参数 -->
        <DatePicker
          v-model:value="formData.changeTime"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </FormItem>
      <FormItem
        label="备注(如:调班原因、替班说明等)"
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
