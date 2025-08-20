<script setup>
import { inject, ref } from "vue"
import { useRouter } from "vue-router"
import socketManager from '../socketManager.js'

// #region global state
const userName = inject("userName")
// #endregion

// #region local variable
const router = useRouter()
const socket = socketManager.getInstance()
// #endregion
const errorMessage = ref("")

// #region reactive variable
const inputUserName = ref("")
// #endregion

// #region browser event handler
// 入室メッセージをクライアントに送信する
const onEnter = () => {
  console.log("onEnter", userName.value)
  // ユーザー名が入力されているかチェック
  userName.value = userName.value.trim()
  if (!userName.value) {
    alert("ユーザー名を入力してください。")
    return
  }
  const pattern = /^[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}a-zA-Z0-9_-]{3,20}$/u;
  if (!pattern.test(userName.value)) {
    alert("ユーザー名は3～20文字以内で、日本語・英数字と「_」「-」のみ使用できます。")
    return
  }

  socket.off("userNameOK")
  socket.once("userNameOK", () => {
    console.log("userNameOK")
    // 入室メッセージを送信
    socket.emit("enterEvent", `${userName.value}が入室しました。`)
    // チャット画面へ遷移
    router.push({ name: "chat" })
  })

  socket.off("userNameError")
  socket.once("userNameError", (msg) => {
    errorMessage.value = msg
  })

  // 全体で使用するnameに入力されたユーザー名を格納
  socket.emit("setUserNameEvent", userName.value)
  // // チャット画面へ遷移
  // router.push({ name: "chatmanager" })
}
// #endregion
</script>

<template>
  <v-container class="fill-height d-flex flex-column justify-center align-center text-center">
    <div>
      <h1 class="text-h4 font-weight-medium">予定管理チャット</h1>
      <h2 class="text-subtitle-1 mt-2">~Chat Control Calendar~</h2>
    </div>

    <v-row class="mt-10" justify="center" no-gutters>
      <!-- アイコン -->
      <v-col cols="auto">
        <div style="height: 56px; display: flex; align-items: center;">
          <span class="text-subtitle-1">👤</span>
        </div>
      </v-col>

      <!-- 入力欄 -->
      <v-col cols="auto" style="min-width: 300px;">
        <div style="height: 56px; display: flex; align-items: center;">
          <v-text-field v-model="userName" variant="outlined" density="comfortable" placeholder="名前を入力してください"
            :error="!!errorMessage" hide-details style="flex: 1;" @keyup.enter="onEnter" />
        </div>
        <!-- エラー文 -->
        <div v-if="errorMessage" class="text-red" style="margin-top: 4px; font-size: 0.875rem; min-height: 1.2em;">
          {{ errorMessage }}
        </div>
      </v-col>

      <!-- ボタン -->
      <v-col cols="auto">
        <div style="height: 56px; display: flex; align-items: center;">
          <v-btn color="primary" @click="onEnter">入室する</v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.user-name-text {
  width: 20em;
  border: 1px solid #888;
  margin-bottom: 16px;
}
</style>
