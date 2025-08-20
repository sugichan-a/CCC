<template>
  <div class="calendar-container">
    <FullCalendar ref="calendarRef" :options="calendarOptions" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick, inject } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import jaLocale from '@fullcalendar/core/locales/ja'

import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'

// --- リアクティブな状態定義 ---

const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null)

// 上位から渡された Map を受け取る
const userColors = inject("userColors") as Map<string, string> || new Map<string, string>()

// --- propsの定義と受け取り ---
const props = defineProps(['schedules', 'userName', 'setCurrentYearMonth'])
const schedules = props.schedules
const userName = props.userName
const setCurrentYearMonth = props.setCurrentYearMonth

// --- fullcalendar で表示付きを変更した時に呼び出されるハンドラ ---
const handleDatesSet = (dateInfo) => {
  const currentDate = dateInfo.view.currentStart
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1 // 0ベースなので+1
  setCurrentYearMonth(year, month)
}

// --- FullCalendar設定 ---

const calendarOptions = {
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  height: 'auto',
  locale: jaLocale,
  events: [], // イベントは `renderAllDayEvents` で動的に設定
  datesSet: handleDatesSet,
  eventDidMount(info) {
    const user = info.event.extendedProps.user
    const title = info.event.title
    tippy(info.el, {
      content: `<strong>${user}</strong><br>${title}`,
      allowHTML: true
    })
  }
}

const colorPalette = [
  '#FF6B6B', '#6BCB77', '#4D96FF', '#FFD93D', '#9D4EDD',
  '#FF922B', '#2EC4B6', '#E63946', '#3A86FF', '#8338EC'
]
let colorIndex = 0

function getColorFromPalette() {
  const color = colorPalette[colorIndex % colorPalette.length]
  colorIndex++
  return color
}

// ユーザーごとの色を管理するマップ
if (!userColors.has(userName.value)) {
  userColors.set(userName.value, getColorFromPalette())
}

/**
 * 終日イベントのみをフィルタリングしてカレンダーに描画する
 */
function renderAllDayEvents() {
  const calendarApi = calendarRef.value?.getApi()
  if (!calendarApi) {
    console.warn("Calendar API not available for rendering.")
    return
  }


  const allDayEvents = schedules
    .filter(item => item.data.allDay === true)
    .map(item => {
      // --- 'item'が使える正しいスコープ ---

      if (!userColors.has(item.user)) {
        userColors.set(item.user, getColorFromPalette())
      }

      // 終了日を調整するコードブロックを、必ずこのmapの内側に配置する
      let inclusiveEndDate = item.data.end;
      if (item.data.end && /^\d{4}-\d{2}-\d{2}$/.test(item.data.end)) {
        const endDate = new Date(item.data.end);
        endDate.setDate(endDate.getDate() + 1);
        inclusiveEndDate = endDate.toISOString().split('T')[0];
      }

      return {
        id: item.data.id,
        title: item.data.title,
        start: item.data.start,
        end: inclusiveEndDate, // 調整後の日付を使用
        allDay: true,
        backgroundColor: userColors.get(item.user),
        borderColor: userColors.get(item.user),
        extendedProps: {
          user: item.user,
          message: item.data.message
        }
      }
    })

  calendarApi.removeAllEvents()
  calendarApi.addEventSource(allDayEvents)

  // 🔍 色の割り当てを出力
  console.log("🎨 現在のユーザーと色の割り当て:")
  userColors.forEach((color, user) => {
    console.log(`👤 ${user} → ${color}`)
  })
}

// --- ライフサイクルフック ---

onMounted(() => {
  nextTick(() => {
    renderAllDayEvents()
    console.log("✅ onMounted: カレンダーに終日イベントを初期表示しました")
  })
})

watch(
  schedules,
  () => {
    renderAllDayEvents()
    console.log("✅ watch: スケジュール変更を検知し、カレンダーを更新しました")
  },
  { deep: true }
)
</script>

<style scoped>
.calendar-container {
  width: 100%;
  max-height: 60vh;
  overflow: hidden;
  font-size: 14px;
}

.debug-panel {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

.debug-panel h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 1.1rem;
  font-weight: 600;
}

.debug-panel input {
  margin: 4px;
  padding: 8px 10px;
  font-size: 1rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.debug-panel input:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
}

.debug-panel button {
  margin-left: 8px;
  padding: 8px 16px;
  font-size: 1rem;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.debug-panel button:hover {
  background-color: #0056b3;
}
</style>
