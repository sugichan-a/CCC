<template>
  <div>
    <Responsive :small-component="ChatmanagerSmall" :large-component="ChatmanagerLarge" :breakpoint="768" />
  </div>
</template>

<script setup>
import { reactive, provide } from 'vue'
import Responsive from './Responsive.vue'
import ChatmanagerLarge from './ChatmanagerLarge.vue';
import ChatmanagerSmall from './ChatmanagerSmall.vue';

// カレンダー予定
const schedules = reactive([])
provide("schedules", schedules)

// チャット履歴
const chatList = reactive([])
provide("chatList", chatList)

// ユーザーごとの色を生成する関数
const userColors = reactive(new Map()) // reactiveで包むと変更が追跡されて良い
provide("userColors", userColors)
</script>