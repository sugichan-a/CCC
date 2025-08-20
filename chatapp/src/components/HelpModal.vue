<template>
    <div class="vfm" v-if="isVisible">
        <transition name="overlay" enter-active-class="vfm-enter-active" leave-active-class="vfm-leave-active"
            enter-class="vfm-enter" leave-to-class="vfm-leave-to">
            <div class="vfm__overlay" @click="closeModal" v-if="isVisible"></div>
        </transition>

        <transition name="content" enter-active-class="vfm-enter-active" leave-active-class="vfm-leave-active"
            enter-class="vfm-enter-from" leave-to-class="vfm-leave-to">
            <div class="vfm__content" v-if="isVisible">
                <div class="modal-header">
                    <h2 class="modal-title">ヘルプ</h2>
                    <button class="close-button" @click="closeModal" type="button">
                        <span>&times;</span>
                    </button>
                </div>

                <div class="modal-body">
                    <div class="help-content">
                        <h3>コマンドの使い方</h3>

                        <div class="datetime-format">
                            <strong>日時の入力フォーマット</strong>
                            <div class="command-syntax">yyyy/mm/dd/hh:mm</div>
                            <p>年/月/日/時:分 の形式で入力してください</p>
                        </div>

                        <div class="faq-item">
                            <h4>スケジュール追加</h4>
                            <div class="command-syntax">\add &lt;タイトル&gt; &lt;開始日時&gt; [終了日時]</div>

                            <div class="examples">
                                <p><strong>例：</strong></p>
                                <div class="example-item">
                                    <strong>終了時刻あり：</strong>
                                    <div class="command-syntax">\add 実装A 2025/07/31/14:00 2025/07/31/18:30</div>
                                </div>
                                <div class="example-item">
                                    <strong>終了時刻なし：</strong>
                                    <div class="command-syntax">\add お昼寝 2025/07/31/15:00</div>
                                </div>
                                <div class="example-item">
                                    <strong>終日予定：</strong>
                                    <div class="command-syntax">\add 締め切り 2025/08/01</div>
                                </div>
                            </div>

                            <div class="note">
                                💡
                                日時は省略可能です．省略した場合は開始時刻のみが記録されます．時刻を省略した場合，終日扱いになります．月カレンダーには終日予定のみ，日カレンダーには時刻指定の予定のみが表示されます．
                            </div>
                        </div>

                        <div class="faq-item">
                            <h4>️スケジュール削除</h4>
                            <div class="command-syntax">\delete &lt;開始日付（日のみ）&gt; &lt;タイトル（部分一致可）&gt;</div>

                            <div class="examples">
                                <p><strong>例：</strong></p>
                                <div class="example-item">
                                    <strong>完全なタイトルで削除：</strong>
                                    <div class="command-syntax">\delete 15 実装A</div>
                                </div>
                                <div class="example-item">
                                    <strong>部分的なタイトルで削除：</strong>
                                    <div class="command-syntax">\delete 15 お昼</div>
                                </div>
                            </div>

                            <div class="note">
                                💡 日付は日のみ（1〜31）を指定し，タイトルは前方一致でも検索できます．
                            </div>
                        </div>
                    </div>
                </div>
                <div class="vfm-swipe-banner-container"></div>
            </div>
        </transition>
    </div>
</template>

<script>
export default {
    name: 'HelpModal',
    props: {
        isVisible: {
            type: Boolean,
            default: false
        }
    },
    emits: ['close'],
    methods: {
        closeModal() {
            this.$emit('close');
        },
        handleKeydown(event) {
            if (event.key === 'Escape') {
                this.closeModal();
            }
        }
    },
    mounted() {
        document.addEventListener('keydown', this.handleKeydown);
    },
    beforeUnmount() {
        document.removeEventListener('keydown', this.handleKeydown);
    }
}
</script>

<style scoped>
.vfm {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.vfm__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    cursor: pointer;
}

.vfm__content {
    position: relative;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    max-width: 600px;
    max-height: 80vh;
    width: 90%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid #e5e5e5;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f8f9fa;
}

.modal-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
}

.close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    color: #666;
    transition: all 0.2s ease;
}

.close-button:hover {
    background-color: #e9ecef;
    color: #333;
}

.modal-body {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
}

/* スクロールバーのカスタマイズ */
.modal-body::-webkit-scrollbar {
    width: 8px;
}

.help-content h3 {
    color: #2c3e50;
    border-bottom: 2px solid #3498db;
    padding-bottom: 8px;
    margin-bottom: 24px;
}

.faq-item {
    margin-bottom: 32px;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 6px;
}

.faq-item h4 {
    color: #2c3e50;
    margin-bottom: 12px;
    font-size: 1.2em;
}

.command-syntax {
    background-color: #2d3748;
    color: #e2e8f0;
    padding: 12px 16px;
    border-radius: 6px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    margin: 12px 0;
    border: 1px solid #4a5568;
}

.datetime-format {
    background-color: #f8f9fa;
    padding: 16px;
    border-radius: 6px;
    margin: 16px 0;
}

.datetime-format strong {
    color: #2d3748;
    font-size: 1.1em;
}

.examples {
    margin-top: 16px;
}

.example-item {
    margin-bottom: 12px;
}

.example-item strong {
    color: #2c5282;
}

.note {
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
    color: #856404;
    padding: 12px 16px;
    border-radius: 4px;
    margin-top: 12px;
}

.vfm-swipe-banner-container {
    height: 4px;
    background: linear-gradient(90deg, #007bff, #0056b3);
    margin-top: auto;
}

/* トランジションアニメーション */
.vfm-enter-active,
.vfm-leave-active {
    transition: opacity 0.3s ease;
}

.vfm-enter,
.vfm-leave-to {
    opacity: 0;
}

.vfm-enter-from,
.vfm-leave-to {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
}

.vfm-enter-active .vfm__content,
.vfm-leave-active .vfm__content {
    transition: all 0.3s ease;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
    .vfm__content {
        width: 95%;
        max-height: 90vh;
        margin: 20px;
    }

    .modal-header {
        padding: 16px 20px 12px;
    }

    .modal-title {
        font-size: 1.25rem;
    }
}
</style>