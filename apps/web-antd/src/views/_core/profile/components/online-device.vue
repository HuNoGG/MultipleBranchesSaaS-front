<script setup lang="ts">
import type { Recordable } from '@vben/types';

import type { OnlineUser } from '#/api/monitor/online/model';

import { onMounted, shallowRef } from 'vue';

import { getPopupContainer } from '@vben/utils';

import {
  Card,
  Descriptions,
  DescriptionsItem,
  Popconfirm,
  Spin,
  Tag,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { forceLogout2, onlineDeviceList } from '#/api/monitor/online';
import { renderBrowserIcon, renderOsIcon } from '#/utils/render';

async function handleForceOffline(row: Recordable<any>) {
  await forceLogout2(row.tokenId);
  await loadData();
}

const list = shallowRef<OnlineUser[]>([]);
const loading = shallowRef(false);
async function loadData() {
  loading.value = true;
  const resp = await onlineDeviceList();
  list.value = resp.rows.map((item) => {
    // Windows 10 or Windows Server 2016 太长了 分割一下
    let value = item.os;
    if (value) {
      const split = value.split(' or ');
      if (split.length === 2) {
        value = split[0]!;
      }
      item.os = value;
    }
    return item;
  });
  loading.value = false;
}
onMounted(loadData);
</script>

<template>
  <div class="mb-6">
    <Spin :spinning="loading">
      <div
        class="grid max-h-[calc(100vh/2)] min-h-[100px] grid-cols-1 gap-4 overflow-auto lg:grid-cols-2"
      >
        <Card
          v-for="online in list"
          :key="online.tokenId"
          size="small"
          :title="`登录时间: ${dayjs(online.loginTime).format('YYYY-MM-DD HH:mm:ss')}`"
        >
          <template #extra>
            <Popconfirm
              title="确认强制下线?"
              placement="left"
              :get-popup-container="getPopupContainer"
              @confirm="handleForceOffline(online)"
            >
              <a-button danger size="small">强制下线</a-button>
            </Popconfirm>
          </template>
          <Descriptions size="middle" :column="2">
            <DescriptionsItem label="登录平台">
              <Tag>{{ online.deviceType }}</Tag>
            </DescriptionsItem>
            <DescriptionsItem label="登录地址">
              {{ online.loginLocation }}
            </DescriptionsItem>
            <DescriptionsItem label="浏览器">
              <component :is="renderBrowserIcon(online.browser)" />
            </DescriptionsItem>
            <DescriptionsItem label="系统">
              <component :is="renderOsIcon(online.os)" />
            </DescriptionsItem>
            <DescriptionsItem label="IP地址">
              {{ online.ipaddr }}
            </DescriptionsItem>
          </Descriptions>
        </Card>
      </div>
    </Spin>
  </div>
</template>
