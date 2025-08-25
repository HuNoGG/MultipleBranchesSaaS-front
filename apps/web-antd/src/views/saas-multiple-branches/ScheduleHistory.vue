<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';

import {
  BarChartOutlined,
  CoffeeOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  GoldOutlined,
  HourglassOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  TeamOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

// =================================================================================
// 模拟角色与数据 (MOCK)
// =================================================================================
const userRole = ref('admin'); // 'admin' or 'store'
const loggedInStoreId = 2; // 模拟店铺端登录的店铺ID

const mockDatabase = {
  stores: [
    { id: 1, name: '中心旗舰店' },
    { id: 2, name: '西溪银泰店' },
    { id: 3, name: '滨江宝龙店' },
    { id: 4, name: '萧山万象汇店' },
  ],
  skills: [
    { id: 1, name: '柜台' },
    { id: 2, name: '外场' },
    { id: 3, name: '内场' },
    { id: 4, name: '洗碗' },
    { id: 5, name: '清洁' },
  ],
  // ... 其他模拟数据将在相应部分定义
};

// =================================================================================
// 响应式状态管理
// =================================================================================
const loading = ref(true);
const activeStoreId = ref<number | undefined>(
  userRole.value === 'admin' ? undefined : loggedInStoreId,
);

// --- 数据源 ---
const allStores = ref(mockDatabase.stores);
const allSkills = ref(mockDatabase.skills);

// --- 各面板的数据 ---
const shifts = ref([]);
const employees = ref([]);
const requirements = reactive({ weekday: [], holiday: [], special: [] });
const basicSettings = reactive({
  crossDayRule: 'by_shift_start',
  breakTimes: [
    { start: '14:00', end: '14:30' },
    { start: '20:30', end: '21:00' },
  ],
  employeeTypes: ['干部', '全职', '计时'],
});
const crossStoreSettings = reactive({
  supportRelations: [
    { source: 1, targets: [2, 3] },
    { source: 2, targets: [1] },
  ],
});

// --- 弹窗状态 ---
const isCopySettingsModalVisible = ref(false);
const copySettingsForm = reactive({
  sourceStoreId: null,
  targetStoreIds: [],
  copyItems: [],
});

// =================================================================================
// 页面核心逻辑
// =================================================================================
const selectedStore = computed(() =>
  allStores.value.find((s) => s.id === activeStoreId.value),
);

const loadWorkbenchData = async (storeId) => {
  if (!storeId) {
    shifts.value = [];
    employees.value = [];
    return;
  }
  loading.value = true;
  try {
    // MOCK: 此处应根据 storeId 调用多个API获取所有面板的数据
    console.log(`Loading all configuration data for storeId: ${storeId}`);
    // 模拟班次
    shifts.value = [
      {
        id: 1,
        name: '全天班',
        code: '全',
        startTime: '09:00',
        endTime: '18:00',
        color: '#e6f7ff',
      },
    ];
    // 模拟员工
    employees.value = [
      {
        id: 101,
        name: '张三 (正职)',
        skills: '柜台, 外场',
        priority: 90,
        available: '周一至周五 09:00-23:00',
        support: '西溪银泰店',
      },
      {
        id: 102,
        name: '李四 (兼职)',
        skills: '外场, 清洁',
        priority: 80,
        available: '周末 10:00-22:00',
        support: '-',
      },
    ];
    // 模拟需求
    requirements.weekday = [{ shiftId: 1, '1': 2, '2': 3 }]; // skillId: count
    requirements.holiday = [{ shiftId: 1, '1': 3, '2': 5 }];
  } catch {
    message.error('加载配置数据失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (activeStoreId.value) {
    loadWorkbenchData(activeStoreId.value);
  } else {
    loading.value = false;
  }
});

watch(activeStoreId, (newId) => {
  if (newId) {
    loadWorkbenchData(newId);
  }
});

// --- 交互方法 ---
const handleStoreSelect = (storeId: number) => {
  activeStoreId.value = storeId;
};

const openCopySettingsModal = () => {
  copySettingsForm.sourceStoreId = activeStoreId.value;
  isCopySettingsModalVisible.value = true;
};

const handleCopySettings = () => {
  // MOCK: 调用后台API执行配置复制
  console.log('Copying settings:', copySettingsForm);
  message.success('配置复制任务已提交');
  isCopySettingsModalVisible.value = false;
};
</script>

<template>
  <div class="workbench-container">
    <div class="store-selection-header">
      <h1 class="page-title"><ShopOutlined /> 排班配置工作台</h1>
      <div v-if="userRole === 'admin'">
        <p>请选择您要管理的店铺：</p>
        <div class="store-card-list">
          <div
            v-for="store in allStores"
            :key="store.id"
            class="store-card"
            :class="{ active: store.id === activeStoreId }"
            @click="handleStoreSelect(store.id)"
          >
            <div class="store-card-name">{{ store.name }}</div>
            <div class="store-card-id">ID: {{ store.id }}</div>
          </div>
        </div>
      </div>
      <div v-else>
        <a-alert
          :message="`您正在管理店铺：${selectedStore?.name}`"
          type="success"
          show-icon
        />
      </div>
    </div>

    <a-spin :spinning="loading">
      <div v-if="activeStoreId" class="config-main">
        <a-card class="config-panel">
          <template #title>
            <div class="panel-title">
              <SafetyCertificateOutlined /> 权限与高级设定
            </div>
          </template>
          <template #extra v-if="userRole === 'admin'">
            <a-button type="primary" @click="openCopySettingsModal">
              <CopyOutlined /> 复制店铺设定
            </a-button>
          </template>
          <a-tabs>
            <a-tab-pane key="1" tab="帐号权限管理">
              <p>
                管理可以访问
                <strong>{{ selectedStore?.name }}</strong> 的帐号列表。
              </p>
              <a-alert message="帐号权限管理界面 (开发中)" type="info" />
            </a-tab-pane>
            <a-tab-pane key="2" tab="跨店支援设定">
              <p>
                设定
                <strong>{{ selectedStore?.name }}</strong>
                可以与哪些店铺互相支援。
              </p>
              <a-alert message="跨店支援关系设定界面 (开发中)" type="info" />
            </a-tab-pane>
          </a-tabs>
        </a-card>

        <a-card class="config-panel">
          <template #title>
            <div class="panel-title"><GoldOutlined /> 基本设定</div>
          </template>
          <a-row :gutter="[16, 16]">
            <a-col :md="12" :xs="24">
              <a-list bordered header="班别设定">
                <a-list-item v-for="shift in shifts" :key="shift.id">
                  <a-list-item-meta
                    :title="`${shift.name} (${shift.code})`"
                    :description="`${shift.startTime} - ${shift.endTime}`"
                  />
                  <template #actions>
                    <a-button type="link" size="small">
                      <EditOutlined />
                    </a-button>
                    <a-button type="link" size="small" danger>
                      <DeleteOutlined />
                    </a-button>
                  </template>
                </a-list-item>
                <a-button type="dashed" block class="mt-4">
                  <PlusOutlined /> 新增班别
                </a-button>
              </a-list>
            </a-col>
            <a-col :md="12" :xs="24">
              <a-list bordered header="其他基础设定">
                <a-list-item>
                  跨日工时归属规则:
                  <a-tag color="purple">
                    {{ basicSettings.crossDayRule }}
                  </a-tag>
                </a-list-item>
                <a-list-item>
                  休息时间:
                  <a-tag v-for="(br, i) in basicSettings.breakTimes" :key="i">
                    {{ br.start }}-{{ br.end }}
                  </a-tag>
                </a-list-item>
                <a-list-item>
                  员工分类:
                  <a-tag
                    v-for="t in basicSettings.employeeTypes"
                    :key="t"
                    color="green"
                  >
                    {{ t }}
                  </a-tag>
                </a-list-item>
              </a-list>
            </a-col>
          </a-row>
        </a-card>

        <a-card class="config-panel">
          <template #title>
            <div class="panel-title"><TeamOutlined /> 员工属性配置</div>
          </template>
          <a-table :data-source="employees" :pagination="false" size="small">
            <a-table-column title="员工姓名" data-index="name" key="name" />
            <a-table-column title="技能岗位" data-index="skills" key="skills" />
            <a-table-column
              title="优先分数"
              data-index="priority"
              key="priority"
            />
            <a-table-column
              title="可上班时段"
              data-index="available"
              key="available"
            />
            <a-table-column
              title="支援外店"
              data-index="support"
              key="support"
            />
            <a-table-column title="操作" key="action">
              <a-button type="link">编辑</a-button>
            </a-table-column>
          </a-table>
        </a-card>

        <a-card class="config-panel">
          <template #title>
            <div class="panel-title"><BarChartOutlined /> 每日人力需求</div>
          </template>
          <a-tabs>
            <a-tab-pane key="weekday" tab="平日需求">
              <a-alert
                message="此处为一个 N x M 的表格，行为班次，列为技能，单元格为人数输入框。"
                type="success"
              />
            </a-tab-pane>
            <a-tab-pane key="holiday" tab="假日需求">
              <a-alert message="此处为假日的人力需求矩阵。" type="success" />
            </a-tab-pane>
            <a-tab-pane key="special" tab="特殊节日需求">
              <a-alert
                message="可添加特定日期（如 2025-10-01）的独立需求模型。"
                type="warning"
              />
            </a-tab-pane>
          </a-tabs>
        </a-card>

        <a-row :gutter="16">
          <a-col :md="12" :xs="24">
            <a-card class="config-panel">
              <template #title><CoffeeOutlined /> 休假规则设定</template>
              <a-alert
                message="员工预填休假、排休功能、全职排休冲突规则等在此配置。"
                type="info"
              />
            </a-card>
          </a-col>
          <a-col :md="12" :xs="24">
            <a-card class="config-panel">
              <template #title><HourglassOutlined /> 上班时数规则</template>
              <a-alert
                message="全职/计时工时上限、最长连续上班日等规则在此配置。"
                type="info"
              />
            </a-card>
          </a-col>
        </a-row>
      </div>
      <a-empty
        v-else
        description="请从上方店铺卡片中选择一个店铺以开始配置"
        style="margin-top: 50px"
      />
    </a-spin>

    <a-modal
      v-model:visible="isCopySettingsModalVisible"
      title="一键复制店铺设定"
      @ok="handleCopySettings"
    >
      <a-form layout="vertical">
        <a-form-item label="源店铺">
          <a-input :value="selectedStore?.name" disabled />
        </a-form-item>
        <a-form-item label="目标店铺 (可多选)">
          <a-select
            v-model:value="copySettingsForm.targetStoreIds"
            mode="multiple"
            placeholder="请选择要同步的店铺"
          >
            <a-select-option
              v-for="store in allStores.filter((s) => s.id !== activeStoreId)"
              :key="store.id"
              :value="store.id"
            >
              {{ store.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="选择要复制的项目">
          <a-checkbox-group
            v-model:value="copySettingsForm.copyItems"
            style="display: block"
          >
            <a-row>
              <a-col :span="12">
                <a-checkbox value="shifts">班次设定</a-checkbox>
              </a-col>
              <a-col :span="12">
                <a-checkbox value="requirements"> 人力需求模型 </a-checkbox>
              </a-col>
              <a-col :span="12">
                <a-checkbox value="rules">休假与工时规则</a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style lang="less" scoped>
.workbench-container {
  padding: 16px;
  background-color: #f0f2f5;
}
.store-selection-header {
  background: #fff;
  padding: 16px 24px;
  border-radius: 8px;
  margin-bottom: 16px;
}
.page-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.store-card-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
}
.store-card {
  padding: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  width: 180px;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
    border-color: #40a9ff;
  }

  &.active {
    background: #e6f7ff;
    border-color: #1890ff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}
.store-card-name {
  font-size: 16px;
  font-weight: 500;
}
.store-card-id {
  font-size: 12px;
  color: #888;
}
.config-panel {
  margin-bottom: 16px;
}
.panel-title {
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}
.mt-4 {
  margin-top: 16px;
}
</style>
