<script setup lang="ts">
import type { DictType } from '#/api/system/dict/dict-type-model';

import { computed, h, onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cn } from '@vben/utils';

import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue';
import { Card, Empty, Input, Popconfirm, Space } from 'ant-design-vue';

import { dictTypeList, dictTypeRemove } from '#/api/system/dict/dict-type';

import { emitter } from '../mitt';
import dictTypeModal from './dict-type-modal.vue';

const dictList = ref<DictType[]>([]);
onMounted(async () => {
  const resp = await dictTypeList();
  dictList.value = resp.rows;
});

const [DictTypeModal, modalApi] = useVbenModal({
  connectedComponent: dictTypeModal,
});

function handleAdd() {
  modalApi.setData({});
  modalApi.open();
}

async function handleEdit(record: DictType) {
  modalApi.setData({ id: record.dictId });
  modalApi.open();
}

async function handleDelete(row: DictType) {
  await dictTypeRemove([row.dictId]);
  // TODO: 刷新表格
}

const currentRowId = ref<null | number | string>(null);
function handleRowClick(row: DictType) {
  currentRowId.value = row.dictId;
  emitter.emit('rowClick', row.dictType);
}

const searchValue = ref('');
const searchResultList = computed(() => {
  if (!searchValue.value) {
    return dictList.value;
  }
  return dictList.value.filter((item) =>
    item.dictName.includes(searchValue.value),
  );
});
</script>

<template>
  <Card :class="cn('w-[400px]')" title="字典项列表">
    <template #extra>
      <Space>
        <a-button :icon="h(PlusOutlined)" @click="handleAdd" />
      </Space>
    </template>
    <Input
      placeholder="搜索字典项名称"
      v-model:value="searchValue"
      allow-clear
    />
    <div
      v-if="searchResultList.length > 0"
      class="mt-4 flex cursor-pointer flex-col overflow-y-auto"
    >
      <div
        :class="
          cn('flex items-center justify-between rounded-lg px-2 py-1', {
            'bg-[#ccc]': item.dictId === currentRowId,
          })
        "
        v-for="item in searchResultList"
        :key="item.dictId"
        @click="handleRowClick(item)"
      >
        <div>
          <span>{{ item.dictName }}</span>
          <span class="ml-2 text-sm text-[#666]">{{ item.dictType }}</span>
        </div>
        <div class="flex items-center gap-3 text-sm">
          <EditOutlined class="text-primary" @click.stop="handleEdit(item)" />
          <Popconfirm
            placement="left"
            :title="`确认删除 [${item.dictName}]?`"
            @confirm="handleDelete(item)"
          >
            <DeleteOutlined class="text-destructive" @click.stop="" />
          </Popconfirm>
        </div>
      </div>
    </div>
    <Empty class="mt-4" v-else />
    <DictTypeModal />
  </Card>
</template>

<style scoped>
:deep(.ant-card-body) {
  height: 100%;
  padding: 16px;
  overflow-y: auto;
}
</style>
