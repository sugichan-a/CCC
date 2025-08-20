<script setup lang="ts">
import { computed, inject, onBeforeMount, onMounted, reactive, ref } from "vue"
import socketManager from '../socketManager.js'
import { userNotMessage } from "../util/const.js"
import { createMessageDataFromText } from "../util/createMessageData.js"
import { parseText } from "../util/parseText.js"
import { validateMessage } from "../util/validateMessage.js"
import ChatHistory from './ChatHistory.vue'
import HelpModal from './HelpModal.vue'
// #region global state
const userName = inject("userName")
// #endregion

// #region local variable
const socket = socketManager.getInstance()
// #endregion

// #region reactive variable
const chatContent = ref("")
const chatList = ref([])
const schedules = inject("schedules") // スケジュールの状態を取得
const users = reactive([]) // ユーザ情報を格納するリアクティブな配列
const chatListViewer = computed(() => {
  console.log("cl-viewer",)
  const sorted = [...chatList.value].sort((a, b) => {
    const timeA = new Date(a.postedAt).getTime()
    const timeB = new Date(b.postedAt).getTime()
    return isDateAsc.value ? timeA - timeB : timeB - timeA
  }
  )
  console.log(sorted, isDateAsc.value)
  return sorted
})

const isDateAsc = ref(true);
const setDateAsc = () => {
  isDateAsc.value = !isDateAsc.value
  console.log("change sort", isDateAsc.value)
  chatList.value = [...chatList.value];
}
// #endregion

// #region lifecycle
onMounted(() => {
  registerSocketEvent()

  // 初回に全チャットデータをフェッチする
  console.log("requestInitialMessages")
  socket.emit("requestInitialMessages")

  // ブラウザを閉じる・リロード時に退室する
  window.addEventListener("beforeunload", () => {
    if (userName?.value) {
      socket.emit("exitEvent", `${userName.value}が退室しました。`, userName.value)
    }
  })

  onBeforeMount(() => {
    if (userName?.value) {
      socket.exit("exitEvent", `${userName.value}が退室しました。`, userName.value)
    }
  })

})
// #endregion

// #region browser event handler
// 投稿メッセージをサーバに送信する
const onPublish = () => {
  // 投稿内容をチェックして投稿できるか判断する
  const validateResult = validateMessage(chatContent.value)
  if (!validateResult.isValid) {
    alert(validateResult.error)
    return
  }

  // メッセージ入力イベント（sendMessageEvent）を送信する
  // 名前とメッセージを連結する
  const signal = parseText(chatContent.value, userName.value, currentYearMonth)
  if (!signal) {
    return;
  }
  socket.emit("sendMessageEvent", signal)

  // 入力欄を初期化
  chatContent.value = ""
}

// 退室メッセージをサーバに送信する
const onExit = () => {
  socket.emit("exitEvent", `${userName.value}が退室しました。`, userName.value)
}

const isShowHelp = ref(false)
const openHelp = () => {
  isShowHelp.value = true
  console.log("openHelp", isShowHelp.value)
}
const closeHelp = () => { isShowHelp.value = false }

// #endregion

// #region socket event handler
// サーバから受信した入室メッセージ画面上に表示する
const onReceiveEnter = (data) => {
  chatList.value.push(createMessageDataFromText(data, userNotMessage))
}

// サーバから受信した退室メッセージを受け取り画面上に表示する
const onReceiveExit = (data) => {
  chatList.value.push(createMessageDataFromText(data, userNotMessage))
}
// サーバから受信したメッセージ配列で画面を更新する
const onReceivePublish = (chatRoomState) => {
  console.log("onReceivePublish", chatRoomState)
  // chatListを配列の内容で置き換える
  // chatList.value.splice(0, chatList.length, ...chatRoomState.messages)
  chatList.value = [...chatRoomState.messages];
  // chatmanager.vueのschedulesにスケジュールをセットする
  if (schedules) {
    schedules.splice(0, schedules.length, ...chatRoomState.schedules)
  }

  // ユーザ情報を更新
  users.splice(0, users.length, ...chatRoomState.users)
  console.log("users", users)
}
// #endregion

// #region local methods
// イベント登録をまとめる
const registerSocketEvent = () => {
  // 入室イベントを受け取ったら実行
  socket.on("enterEvent", (data) => {
    console.log("enterEvent", data)
    onReceiveEnter(data)
  })

  // 退室イベントを受け取ったら実行
  socket.on("exitEvent", (data) => {
    console.log("exitEvent", data)
    chatList.value.push(createMessageDataFromText(data, userNotMessage))
  })

  // 投稿イベントを受け取ったら実行
  socket.on("publishEvent", (messagesArray) => {
    onReceivePublish(messagesArray)
  })

  socket.on("errorMessage", (errorMessage) => {
    alert(`エラー: ${errorMessage}`)
  })
}
// #endregion

// Enterキーが押された時の処理
const onKeyDown = (event) => {
  // Enterキーが押され、かつShiftキーが押されていない場合に投稿
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault() // デフォルトの改行を防ぐ
    onPublish()
  }
  // Shift + Enterの場合は改行を許可（デフォルト動作）
}

// --- propsの定義と受け取り ---

const props = defineProps(['currentYearMonth'])
const currentYearMonth = props.currentYearMonth

// 入室時刻のフォーマット
const formatEnterdAt = (isoString) => {
  const date = new Date(isoString);
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

</script>
<template>
  <v-container class="py-10" max-width="600">
    <v-card class="pa-6" elevation="10" rounded="xl">
      <!-- タイトルとヘルプボタンを横並びに -->
      <div class="d-flex justify-space-between align-center mb-4">
        <v-card-title class="text-h5 font-weight-medium pa-0">
          予定管理チャット
        </v-card-title>
        <v-btn icon size="small" color="grey" class="ml-2">
          <v-btn icon size="small" color="grey" @click="openHelp">
            <span class="text-h6 font-weight-bold">?</span>
          </v-btn>

        </v-btn>
      </div>

      <v-card-subtitle class="text-subtitle-1 mb-2">
        ログインユーザ：
        <v-tooltip>
          <template v-slot:activator="{ props }">
            <span v-bind="props" style="cursor: pointer;">
              <strong>{{ userName }}</strong>
            </span>
          </template>
          <div v-for="user in users" :key="user.id">
            {{ user.name }}（最終ログイン：{{ formatEnterdAt(user.enteredAt) }}）
          </div>
        </v-tooltip>
        さん
      </v-card-subtitle>


      <v-textarea v-model="chatContent" label="予定管理 or チャット" rows="4" variant="outlined" @keydown="onKeyDown"
        class="mb-4"></v-textarea>

      <v-row class="mb-4" dense>
        <v-col cols="6">
          <v-btn color="primary" variant="flat" block @click="onPublish">
            投稿
          </v-btn>
        </v-col>
        <v-col cols="6">
          <v-btn color="secondary" variant="flat" block @click="setDateAsc">
            {{ isDateAsc ? '最新を表示中' : '最古を表示中' }}
          </v-btn>
        </v-col>
      </v-row>

      <v-divider class="my-4"></v-divider>

      <ChatHistory :chat-list="chatListViewer" :userName="userName" />

      <v-divider class="my-4"></v-divider>

      <router-link to="/" class="text-decoration-none">
        <v-btn block color="error" variant="flat" @click="onExit">
          退室する
        </v-btn>
      </router-link>
    </v-card>
  </v-container>
  <!-- ヘルプモーダル -->
  <HelpModal :isVisible="isShowHelp" @close="closeHelp" />
</template>
