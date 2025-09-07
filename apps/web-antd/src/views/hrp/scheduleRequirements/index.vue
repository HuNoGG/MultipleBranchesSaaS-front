<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Page } from '@vben/common-ui';
import { Spin, Button, message } from 'ant-design-vue';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';

import {
  scheduleRequirementsList,
  scheduleRequirementsAdd,
  scheduleRequirementsUpdate,
  scheduleRequirementsRemove,
} from '#/api/hrp/scheduleRequirements';
import { skillsList } from '#/api/hrp/skills';
import { shiftsList } from '#/api/hrp/shifts';

import type { ScheduleRequirement } from '#/api/hrp/scheduleRequirements/model';
import type { Skill } from '#/api/hrp/skills/model';
import type { Shift } from '#/api/hrp/shifts/model';

dayjs.extend(weekOfYear);

const loading = ref(true);
const skills = ref<Skill[]>([]);
const shifts = ref<Shift[]>([]);
const requirements = ref<ScheduleRequirement[]>([]);
const storeId = ref('1'); // Assuming a default store ID for now

const weekDates = ref<string[]>([]);
const gridData = ref<Record<string, Record<string, Record<string, number | null>>>>({});

const getWeekDateRange = () => {
  const startOfWeek = dayjs().startOf('week');
  const dates = [];
  for (let i = 0; i < 7; i++) {
    dates.push(startOfWeek.add(i, 'day').format('YYYY-MM-DD'));
  }
  return dates;
};

const processRequirements = (
  skills: Skill[],
  shifts: Shift[],
  requirements: ScheduleRequirement[],
  dates: string[],
) => {
  const data: Record<string, Record<string, Record<string, any>>> = {};
  skills.forEach(skill => {
    data[skill.id] = {};
    dates.forEach(date => {
      data[skill.id][date] = {};
      shifts.forEach(shift => {
        const req = requirements.find(
          r => r.skillId === skill.id && r.date === date && r.shiftId === shift.id,
        );
        data[skill.id][date][shift.id] = {
          count: req ? req.requiredCount : null,
          original: req || null, // Keep track of the original requirement object
        };
      });
    });
  });
  gridData.value = data;
};

const handleSave = async () => {
  loading.value = true;
  const promises = [];

  for (const skillId in gridData.value) {
    for (const date in gridData.value[skillId]) {
      for (const shiftId in gridData.value[skillId][date]) {
        const cell = gridData.value[skillId][date][shiftId];
        const newCount = cell.count;
        const originalReq = cell.original;

        const hasNewValue = newCount !== null && newCount > 0;
        const hadOldValue = originalReq !== null;

        if (hasNewValue && !hadOldValue) {
          // Add new
          promises.push(scheduleRequirementsAdd({ skillId, date, shiftId, requiredCount: newCount, storeId: storeId.value }));
        } else if (hasNewValue && hadOldValue && newCount !== originalReq.requiredCount) {
          // Update existing
          promises.push(scheduleRequirementsUpdate({ ...originalReq, requiredCount: newCount }));
        } else if (!hasNewValue && hadOldValue) {
          // Delete existing
          promises.push(scheduleRequirementsRemove(originalReq.id));
        }
      }
    }
  }

  try {
    await Promise.all(promises);
    message.success('更改已保存');
    await fetchData(); // Refresh data from server
  } catch (error) {
    console.error('Failed to save changes:', error);
    message.error('保存失败');
  } finally {
    loading.value = false;
  }
};

const fetchData = async () => {
  loading.value = true;
  try {
    weekDates.value = getWeekDateRange();
    const [skillsData, shiftsData, requirementsData] = await Promise.all([
      skillsList({ storeId: storeId.value }),
      shiftsList({ storeId: storeId.value }),
      scheduleRequirementsList({
        storeId: storeId.value,
        beginDate: weekDates.value[0],
        endDate: weekDates.value[6],
        pageSize: 999, // Fetch all for the week
      }),
    ]);

    skills.value = skillsData.rows;
    shifts.value = shiftsData.rows;
    requirements.value = requirementsData.rows;

    processRequirements(skills.value, shifts.value, requirements.value, weekDates.value);

  } catch (error) {
    console.error('Failed to fetch schedule requirement data:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

</script>

<template>
  <Page :auto-content-height="true">
    <template #header-extra>
      <Button type="primary" :loading="loading" @click="handleSave">保存更改</Button>
    </template>
    <Spin :spinning="loading">
      <div v-if="!loading" class="p-4">
        <table class="schedule-grid">
          <thead>
            <tr>
              <th class="skill-header">技能/岗位</th>
              <th v-for="date in weekDates" :key="date" class="date-header">
                {{ dayjs(date).format('ddd') }} <br>
                {{ dayjs(date).format('MM-DD') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="skill in skills" :key="skill.id">
              <td class="skill-cell">{{ skill.name }}</td>
              <td v-for="date in weekDates" :key="date" class="data-cell">
                <div class="shift-wrapper">
                  <div v-for="shift in shifts" :key="shift.id" class="shift-cell">
                    <span class="shift-name">{{ shift.name }}</span>
                    <a-input-number
                      v-if="gridData[skill.id] && gridData[skill.id][date]"
                      v-model:value="gridData[skill.id][date][shift.id].count"
                      :min="0"
                      :max="99"
                      placeholder="-"
                      class="shift-input"
                    />
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Spin>
  </Page>
</template>

<style scoped>
.schedule-grid {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.schedule-grid th,
.schedule-grid td {
  border: 1px solid #e8e8e8;
  padding: 8px;
  text-align: center;
}

.skill-header {
  width: 150px;
  background-color: #fafafa;
}

.date-header {
  background-color: #fafafa;
}

.skill-cell {
  background-color: #fafafa;
  font-weight: bold;
}

.data-cell {
  padding: 0;
  vertical-align: top;
}

.shift-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.shift-cell {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  border-bottom: 1px solid #f0f0f0;
}

.shift-cell:last-child {
  border-bottom: none;
}

.shift-name {
  font-size: 12px;
}

.shift-input {
  width: 60px;
}
</style>
