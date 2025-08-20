<script setup>
import { watchEffect, inject, ref } from 'vue'
import Chat from './Chat.vue'
import Monthcalendar from './Monthcalendar.vue'
import OneDayGanttChart from './OneDayGanttChart.vue'

const userName = inject('userName', '')
// console.log("Chatmanager.vue schedules", schedules)

// console.log("Chatmanager.vue userColors", userColors)
// 3. 変更を検知してコンソールに出力する（確認用）
watchEffect(() => {
  // このコールバックは、userColorsが変更されるたびに実行されます
  console.log('🎨 [親コンポーネント] userColorsの変更を検知しました！');

  // マップの現在のサイズや内容を確認
  const userColors = inject('userColors', () => new Map())
  console.log(`現在の登録数: ${userColors.size}件`);
  userColors.forEach((color, user) => {
    console.log(`  -> 👤 ${user}: ${color}`);
  });
});


// 現在年月
const today = new Date()
const currentYearStr = today.getFullYear().toString()
const currentMonthStr = (today.getMonth() + 1).toString().padStart(2, '0')
const currentYearMonth = ref(`${currentYearStr}-${currentMonthStr}`)
const setCurrentYearMonth = (year, month) => {
  currentYearMonth.value = `${year}-${month.toString().padStart(2, '0')}`
}

const schedules = inject('schedules')

</script>

<template>
  <div class="chat-manager">
    <div class="left-column">
      <Monthcalendar :schedules=schedules :userName=userName :setCurrentYearMonth=setCurrentYearMonth />
      <OneDayGanttChart :schedules=schedules />
    </div>
    <Chat :currentYearMonth=currentYearMonth />
  </div>
</template>

<style scoped>
.chat-manager {
  display: flex;
  flex-direction: row;
  gap: 20px;
  padding: 2em;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>