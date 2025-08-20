<template>
  <div
    class="chat-list"
    v-if="chatList.length !== 0"
    ref="chatListContainer"
    style="max-height: 300px; overflow-y: auto;"
  >
    <ul>
      <ChatItem
        v-for="(chat, index) in chatList"
        :key="index"
        :chat="chat"
        :index="index"
        :userName="userName"
      />
    </ul>
  </div>
</template>

<script>
import ChatItem from './ChatItem.vue';

export default {
  name: 'ChatHistory',
  components: {
    ChatItem
  },
  props: {
    chatList: {
      type: Array,
      required: true,
      default: () => []
    },
    userName: {
      type: String,
      required: true
    }
  },
  watch: {
    chatList() {
      this.$nextTick(() => {
        const container = this.$refs.chatListContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  },
  mounted() {
    const container = this.$refs.chatListContainer;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
};
</script>

<style scoped>
.chat-list {
  margin-top: 1.25rem; /* mt-5 相当 */
}
</style>
