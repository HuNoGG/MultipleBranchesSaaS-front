<script setup lang="ts">
import type { DictType } from '#/api/system/dict/dict-type-model';

import { computed, h, onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cn } from '@vben/utils';

import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  PlusOutlined,
  SyncOutlined,
} from '@ant-design/icons-vue';
import {
  Empty,
  Input,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Tooltip,
} from 'ant-design-vue';

import {
  dictTypeExport,
  dictTypeList,
  dictTypeRemove,
  refreshDictTypeCache,
} from '#/api/system/dict/dict-type';
import { commonDownloadExcel } from '#/utils/file/download';

import { emitter } from '../mitt';
import dictTypeModal from './dict-type-modal.vue';

const dictList = ref<DictType[]>([]);
const loading = ref(false);

async function loadData(reset = false) {
  loading.value = true;

  if (reset) {
    currentRowId.value = '';
    emitter.emit('rowClick', '');
    searchValue.value = '';
  }

  const resp = await dictTypeList();
  dictList.value = resp.rows;

  loading.value = false;
}

onMounted(loadData);

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

function handleDownloadExcel() {
  commonDownloadExcel(dictTypeExport, '字典类型数据');
}

function handleRefreshCache() {
  Modal.confirm({
    title: '提示',
    content: '确认刷新字典类型缓存吗？',
    okButtonProps: {
      danger: true,
    },
    onOk: async () => {
      await refreshDictTypeCache();
      // TODO: 刷新表格
    },
  });
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
  const names = dictList.value.filter((item) =>
    item.dictName.includes(searchValue.value),
  );
  const types = dictList.value.filter((item) =>
    item.dictType.includes(searchValue.value),
  );
  return [...new Set([...names, ...types])];
});

const emptyImage = Empty.PRESENTED_IMAGE_SIMPLE;
</script>

<template>
  <div
    :class="
      cn(
        'bg-background flex h-[calc(100vh-120px)] w-[360px] flex-col overflow-y-hidden',
        'rounded-lg',
      )
    "
  >
    <div :class="cn('flex items-center justify-between', 'border-b px-4 py-2')">
      <span class="font-semibold">字典项列表</span>
      <Space>
        <Tooltip title="刷新缓存">
          <a-button :icon="h(SyncOutlined)" @click="handleRefreshCache" />
        </Tooltip>
        <Tooltip :title="$t('pages.common.export')">
          <a-button :icon="h(ExportOutlined)" @click="handleDownloadExcel" />
        </Tooltip>
        <Tooltip :title="$t('pages.common.add')">
          <a-button :icon="h(PlusOutlined)" @click="handleAdd" />
        </Tooltip>
      </Space>
    </div>
    <div class="flex flex-1 flex-col overflow-y-hidden p-4">
      <Input
        placeholder="搜索字典项名称/类型"
        v-model:value="searchValue"
        allow-clear
      >
        <template #addonAfter>
          <Tooltip title="重置/刷新">
            <SyncOutlined @click="loadData(true)" />
          </Tooltip>
        </template>
      </Input>
      <div
        v-if="searchResultList.length > 0"
        class="mt-4 flex cursor-pointer flex-col overflow-y-auto"
      >
        <Spin :spinning="loading">
          <div
            :class="
              cn(
                'flex items-center justify-between rounded-lg px-2 py-2',
                {
                  'bg-accent-hover': item.dictId === currentRowId,
                },
                'border-b',
              )
            "
            v-for="item in searchResultList"
            :key="item.dictId"
            @click="handleRowClick(item)"
          >
            <div class="flex flex-col overflow-hidden">
              <span class="font-medium">{{ item.dictName }}</span>
              <span
                class="min-w-0 text-ellipsis whitespace-nowrap text-sm text-[#666]"
              >
                {{ item.dictType }}
              </span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <EditOutlined
                class="text-primary"
                @click.stop="handleEdit(item)"
              />
              <Popconfirm
                placement="left"
                :title="`确认删除 [${item.dictName}]?`"
                @confirm="handleDelete(item)"
              >
                <DeleteOutlined class="text-destructive" @click.stop="" />
              </Popconfirm>
            </div>
          </div>
        </Spin>
      </div>
      <Empty
        :image="emptyImage"
        class="mt-4"
        v-if="searchResultList.length === 0"
      />
    </div>
    <div class="border-t px-4 py-3">
      共 {{ searchResultList.length }} 条数据
    </div>
    <DictTypeModal />
  </div>
</template>
