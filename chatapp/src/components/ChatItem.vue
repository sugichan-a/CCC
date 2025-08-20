<script>
export default {
  name: 'ChatItem',
  props: {
    chat: {
      type: [String, Object],
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    userName: {
      type: String,
      required: true
    }
  },
  computed: {
    isOwnMessage() {
      return this.chat.user === this.userName;
    }
  },
  methods: {
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      if (isToday) {
        // 今日の場合は時刻のみ表示
        return date.toLocaleTimeString('ja-JP', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        // 今日以外は日付と時刻を表示
        return date.toLocaleDateString('ja-JP', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    },
    decodeHtmlEntities(str) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(str, 'text/html');
        return doc.documentElement.textContent;
    }
  }
}
</script>

<template>
  <li class="item">
    <div class="message-container" :class="{ 'own-message': isOwnMessage }">
      <div class="message-header">
        <span class="user-name">{{ chat.user }}</span>
        <span class="posted-time">{{ formatTime(chat.postedAt) }}</span>
      </div>
      <div class="message-content">
        {{ decodeHtmlEntities(chat.message) }}
      </div>
    </div>
  </li>
</template>

<style scoped>
.item {
  margin-top: 1rem; /* mt-4 相当 */
  list-style: none;
}
.message-container {
  background-color: #efefef; /* bg-gray-100 */
  border-radius: 0.5rem; /* rounded-lg */
  padding: 0.75rem; /* p-3 */
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); /* shadow-sm */
  max-width: 100%;
}
.message-container.own-message {
  background-color: #b5f892; /* 自分のメッセージの背景色 */
}
.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.user-name {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}
.posted-time {
  font-size: 0.75rem;
  color: #6b7280;
}
.message-content {
  color: #1f2937;
  font-size: 0.875rem;
  line-height: 1.5;
  word-wrap: break-word;
}
</style>
