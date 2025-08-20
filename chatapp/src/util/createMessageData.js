// メッセージの型

import { idNotMessage, userNotMessage } from "./const"
import { sanitizeText } from "./sanitize.js"


export const createMessageDataFromText = (text, user) => {
  return {
    id: (user === userNotMessage) ? idNotMessage : crypto.randomUUID(),
    postedAt: new Date().toISOString(),
    user: user,
    message: sanitizeText(text),
  }
}
