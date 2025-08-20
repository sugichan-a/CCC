<template>
  <div class="gantt-container" :style="{ height: dynamicHeight }">
    <g-gantt-chart
      :chart-start="chartStart"
      :chart-end="chartEnd"
      precision="hour"
      :bar-start="barStart"
      :bar-end="barEnd"
      :date-format="{
        hour: 'HH:mm',
        day: 'DD.MM.YYYY'
      }"
      :width="width"
      :hide-timeaxis="false"
      :grid="true"
      theme="material"
      :row-height="40"
    >
      <g-gantt-row
        v-for="(task, index) in processedTasks"
        :key="index"
        :label="task.label"
        :bars="task.bars"
        :highlight-on-hover="true"
      />
    </g-gantt-chart>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import { GGanttChart, GGanttRow } from '@infectoone/vue-ganttastic'

// Props定義
const props = defineProps({
  schedules: {
    type: Array,
    required: false,
    default: () => []
  },
  width: {
    type: String,
    default: '100%'
  }
})

// Injected schedules
const injectedSchedules = inject('schedules', [])

// Injected user colors
const userColors = inject('userColors', new Map())


// ユーザーごとの色を取得する関数
function getUserColor(username) {
  // 共有されたMapから色を取得するだけ。
  // 万が一色がなかった場合のために、デフォルトの色（例：グレー）を返す
  return userColors.get(username) || '#808080'; 
}


// Active schedules - injectedを優先、なければpropsを使用
const activeSchedules = computed(() => {
  return injectedSchedules.length > 0 ? injectedSchedules : props.schedules
})

// Chart start time
const chartStart = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today.toISOString()
})

// Chart end time
const chartEnd = computed(() => {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return today.toISOString()
})

// Bar properties
const barStart = computed(() => 'myStart')
const barEnd = computed(() => 'myEnd')

// Processed tasks
const processedTasks = computed(() => {
  const groupedByUser = {}

  activeSchedules.value.forEach(signal => {
    if (signal.type === 'addSchedule' && signal.data) {
      const username = signal.user || 'Unknown User'
      const schedule = signal.data

      // allDayがtrueの場合はスキップ
      if (schedule.allDay) {
        return
      }

      if (!groupedByUser[username]) {
        groupedByUser[username] = {
          label: username,
          bars: []
        }
      }

      // 終了時間の処理
      let endTime = schedule.end
      if (!endTime) {
        const startDate = new Date(schedule.start)
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)
        endTime = endDate.toISOString()
      }

      // ユーザーごとの色を取得
      const userColor = getUserColor(username)

      // スケジュールをバーとして追加
      groupedByUser[username].bars.push({
        myStart: schedule.start,
        myEnd: endTime,
        ganttBarConfig: {
          id: schedule.id,
          label: schedule.title || 'スケジュール',
          style: {
            background: userColor,
            color: '#ffffff',
            borderRadius: '4px',
            fontSize: '12px'
          }
        }
      })
    }
  })

  return Object.values(groupedByUser)
})

// Dynamic height
const dynamicHeight = computed(() => {
  const rowHeight = 40
  const headerHeight = 50
  const padding = 20
  const rowCount = processedTasks.value.length
  const minHeight = headerHeight + rowHeight + padding
  const calculatedHeight = headerHeight + (rowCount * rowHeight) + padding
  return Math.max(minHeight, calculatedHeight) + 'px'
})
</script>

<style scoped>
.gantt-container {
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: auto;
}

/* Ganttチャートのカスタムスタイル */
:deep(.g-gantt-chart) {
  font-family: 'Roboto', sans-serif;
  height: 100%;
}

:deep(.g-gantt-row-label) {
  font-weight: 500;
  color: #333;
}

:deep(.g-timeaxis) {
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
}
</style>