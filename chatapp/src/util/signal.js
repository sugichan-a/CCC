// フロントエンドからバックエンドに送られる型
// メッセージ・スケージュール情報をバックエンドに送る共通型
// メッセージとスケージュールをラップしただけ


export const createMessageScheduleData = (obj, user, type) => {
  return {
    type: type,
    user: user,
    data: obj,
  }
}
