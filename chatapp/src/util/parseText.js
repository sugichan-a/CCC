import { createMessageDataFromText } from './createMessageData.js'
import { createDeleteScheduleFromCommand, createScheduleDataFromCommand } from './parseDate.js'
import { createMessageScheduleData } from './signal.js'

// vueから呼び出される
// チャット入力テキストをパースしてsignal型に変換する

export const parseText = (text, user, currentYearMonth) => {
  const ADD = '\\add'
  const DELETE = '\\delete'

  if (text.length >= ADD.length && text.startsWith(ADD)) {
    const schedule = createScheduleDataFromCommand(text)
    if (schedule) {
      return createMessageScheduleData(schedule, user, 'addSchedule')
    }
    return null
  }

  if (text.length >= DELETE.length && text.startsWith(DELETE)) {
    const schedule = createDeleteScheduleFromCommand(text, currentYearMonth)
    if (schedule) {
      return createMessageScheduleData(schedule, user, 'deleteSchedule')
    }
    return null
  }

  const messageData = createMessageDataFromText(text, user)
  if (messageData) {
    return createMessageScheduleData(messageData, user, 'addMessage')
  }
  return null
}
