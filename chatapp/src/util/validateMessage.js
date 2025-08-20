/**
 * vueから呼ばれる
 * 投稿内容が有効かどうかチェックして判定結果をオジェクトで返す
 * @param {string} message - チェックするメッセージ
 * @returns {Object} バリデーション結果 { isValid: boolean, error: string | null }
 */

export const validateMessage = (message) => {
  // null や undefined のチェック
  if (message == null) {
    return {
      isValid: false,
      error: 'メッセージが入力されていません'
    };
  }

  // 文字列でない場合
  if (typeof message !== 'string') {
    return {
      isValid: false,
      error: 'メッセージは文字列である必要があります'
    };
  }

  // 空文字のチェック
  if (message.length === 0) {
    return {
      isValid: false,
      error: 'メッセージが空です'
    };
  }

  // 空白文字のみかチェック（スペース、タブ、改行など）
  // 全角スペースを半角スペースに変換してtrimした後の文字数でチェックする
  const tmpMessage = message.replace(/\u3000/g, ' ');
  if (tmpMessage.trim().length === 0) {
    return {
      isValid: false,
      error: '空白のみのメッセージは送信できません'
    };
  }

  // すべてのチェックを通過
  return {
    isValid: true,
    error: null
  };
}
