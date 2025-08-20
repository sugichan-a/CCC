<template>
  <FullCalendar :options="daycalendar" /> // カレンダー本体
</template>

<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import timeGridPlugin from '@fullcalendar/timegrid'
import jaLocale from '@fullcalendar/core/locales/ja'
const daycalendar = {
  plugins: [timeGridPlugin], // 表示形式のプラグイン
  initialView: 'timeGridDay', // 初期表示形式の設定
  height: 'auto', // カレンダーの高さを自動調整
  locale: jaLocale, // 日本語表示
}
</script>