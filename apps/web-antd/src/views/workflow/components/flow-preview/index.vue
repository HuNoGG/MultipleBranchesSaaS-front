<script setup lang="ts">
import type { ZoomParamType } from '@logicflow/core';

import { onMounted, shallowRef, useTemplateRef, watch } from 'vue';

import { usePreferences } from '@vben/preferences';

import {
  MinusCircleOutlined,
  PlusCircleOutlined,
  ShrinkOutlined,
} from '@ant-design/icons-vue';
import LogicFlow from '@logicflow/core';

import Between from './model/between';
import End from './model/end';
import Parallel from './model/parallel';
import Serial from './model/serial';
import Skip from './model/skip';
import Start from './model/start';
import { json2LogicFlowJson } from './model/tool';

import '@logicflow/core/lib/style/index.css';

const props = withDefaults(defineProps<{ data?: object }>(), {
  data: () => ({}),
});

const container = useTemplateRef('container');
const lf = shallowRef<LogicFlow | null>(null);

function zoomViewport(zoom: ZoomParamType) {
  if (!lf.value) {
    return;
  }
  lf.value.zoom(zoom);
  // 将内容平移至画布中心
  lf.value.translateCenter();
}

onMounted(async () => {
  if (props.data && container.value) {
    const data = json2LogicFlowJson(props.data);
    lf.value = new LogicFlow({
      container: container.value,
      isSilentMode: true,
      textEdit: false,
      grid: {
        size: 20,
        type: 'dot',
        config: {
          color: '#ccc',
          thickness: 1,
        },
      },
      background: {
        backgroundColor: '#fff',
      },
    });

    lf.value.register(Start);
    lf.value.register(Between);
    lf.value.register(Serial);
    lf.value.register(Parallel);
    lf.value.register(End);
    lf.value.register(Skip);

    lf.value.render(data);
    lf.value.translateCenter();
  }
});

const { isDark } = usePreferences();
watch(isDark, (v) => {
  if (!lf.value) {
    return;
  }
  lf.value.graphModel.background = {
    background: v ? '#333' : '#fff',
  };
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between py-2">
      <div class="flex items-center gap-3">
        <a-button @click="zoomViewport(1)">
          <template #icon>
            <ShrinkOutlined />
          </template>
        </a-button>
        <a-button @click="zoomViewport(true)">
          <template #icon>
            <PlusCircleOutlined />
          </template>
        </a-button>
        <a-button @click="zoomViewport(false)">
          <template #icon>
            <MinusCircleOutlined />
          </template>
        </a-button>
      </div>
      <div class="flex items-center gap-3 font-semibold">
        <span class="rounded-md border border-[#000] px-2">未办理</span>
        <span
          class="rounded-md border border-dashed border-[#ffcd17] bg-[#fff8dc] px-2 dark:text-black"
        >
          待办理
        </span>
        <span
          class="rounded-md border border-[#9dff00] bg-[#f0ffd9] px-2 dark:text-black"
        >
          已完成
        </span>
      </div>
    </div>
    <!-- 容器区域 -->
    <div class="h-[500px] w-full border" ref="container"></div>
  </div>
</template>
