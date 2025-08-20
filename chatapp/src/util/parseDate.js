// yyyy/mm/dd/hh:mm形式専用の日付パーサー

import { sanitizeText } from "./sanitize"

// 以下の形式に対応
// '2024/7/30/10:30'       1桁月・日
// '2024/07/30/10:30'      2桁月・日
// '2024/1/5/9:15'         すべて1桁
// '2024/12/25/23:59'      すべて2桁
// '2024/2/29/0:0'         うるう年・最小時刻
// '2024/6/15/12:5'        分が1桁

// createScheduleDataFromCommand 関数
// チャット入力1つからのコマンドを解析してスケジュールデータを生成する関数
// 内部ではparseToISO8601を呼び出す
// 引数1: チャット入力テキスト
// コマンド タイトル 開始日時 [終了日時]

// parseToISO8601 関数
// 日時文字列を生成する
// 引数1: 入力日時文字列

// 文字列を左ゼロパディング
const padZero = (num, length = 2) => String(num).padStart(length, '0')

// yyyy/mm/dd hh:mm形式の文字列をパース
const parseYMDHM = (dateString) => {
  if (!dateString || typeof dateString !== 'string') {
    return null
  }

  const trimmed = dateString.trim()

  // yyyy/mm/dd hh:mm 形式のパターン（1桁も対応）
  const patternWithTime = /^(\d{4})\/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{1,2})$/
  const matchWithTime = trimmed.match(patternWithTime)

  if (matchWithTime) {
    const year = parseInt(matchWithTime[1])
    const month = parseInt(matchWithTime[2])
    const day = parseInt(matchWithTime[3])
    const hour = parseInt(matchWithTime[4])
    const minute = parseInt(matchWithTime[5])

    // 妥当性チェック
    if (month < 1 || month > 12 ||
      day < 1 || day > 31 ||
      hour < 0 || hour > 23 ||
      minute < 0 || minute > 59) {
      return null
    }

    return new Date(year, month - 1, day, hour, minute)
  }

  // yyyy/mm/dd 形式のパターン（日付のみ）
  const patternDateOnly = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/
  const matchDateOnly = trimmed.match(patternDateOnly)

  if (matchDateOnly) {
    const year = parseInt(matchDateOnly[1])
    const month = parseInt(matchDateOnly[2])
    const day = parseInt(matchDateOnly[3])

    // 妥当性チェック
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return null
    }

    return new Date(year, month - 1, day)
  }

  return null
}

// DateオブジェクトをISO8601形式に変換
const formatISO8601 = (date, includeTime = true) => {
  const year = date.getFullYear()
  const month = padZero(date.getMonth() + 1)
  const day = padZero(date.getDate())

  if (!includeTime) {
    return `${year}-${month}-${day}`
  }

  const hour = padZero(date.getHours())
  const minute = padZero(date.getMinutes())
  const second = padZero(date.getSeconds())

  return `${year}-${month}-${day}T${hour}:${minute}:${second}`
}

// 日付を含むかを判定する
// 日時文字列を変換しやすくするために日付と時間の間のスラッシュを空白に置換する
const checkIsContainTime = (dateString) => {
  const parts = dateString.split('/')
  if (parts.length === 4) {
    return {
      convertedDateString: parts[0] + '/' + parts[1] + '/' + parts[2] + ' ' + parts[3],
      isContainTime: true
    }
  }
  return {
    convertedDateString: dateString,
    isContainTime: false
  }
}


// yyyy/mm/dd hh:mm形式をISO8601に変換
const parseToISO8601 = (dateString) => {
  const { convertedDateString, isContainTime } = checkIsContainTime(dateString)
  const includeTime = isContainTime

  try {
    const parsedDate = parseYMDHM(convertedDateString)

    if (!parsedDate || isNaN(parsedDate.getTime())) {
      return null
    }

    return {
      date: formatISO8601(parsedDate, includeTime),
      isContainTime: includeTime
    }

  } catch (error) {
    console.warn('日付のパースに失敗:', dateString, error)
    return null
  }
}

export const createScheduleDataFromCommand = (text) => {
  // 1行目のみ抽出
  const firstLine = text.split('\n')[0].trim()
  // 連続した空白も1つとみなして空白で分割
  const splited = firstLine.split(/\s+/)
  const title = splited.length > 1 ? splited[1] : undefined
  const startResult = splited.length > 2 ? parseToISO8601(splited[2]) : undefined
  const endResult = splited.length > 3 ? parseToISO8601(splited[3]) : undefined

  if (!title || !startResult) {
    alert('タイトルまたは開始日時がありません')
    return null // タイトルまたは開始日時がない場合は無効
  }
  if (endResult && startResult.date > endResult.date) {
    alert('終了日時は開始日時より後に設定してください')
    return null // 終了日時が開始日時より前の場合は無効
  }
  if (startResult) {
    return {
      id: crypto.randomUUID(),
      title: sanitizeText(title),
      start: startResult.date,
      ...(endResult && { end: endResult.date }),
      allDay: !endResult || !startResult.isContainTime || !endResult.isContainTime,
    }
  }
  alert('開始日時の形式が正しくありません')
  return null
}

const isValidYYYYMMDD = (str) => {
  // YYYY/MM/DD形式の正規表現チェック
  const yyyymmddPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!yyyymmddPattern.test(str)) {
    return false;
  }

  const [year, month, day] = str.split('-').map(Number);

  // 年の範囲チェック（1000-9999の4桁年）
  if (year < 1000 || year > 9999) {
    return false;
  }

  // 月の範囲チェック (1-12)
  if (month < 1 || month > 12) {
    return false;
  }

  // 日の範囲チェック (1-31)
  if (day < 1 || day > 31) {
    return false;
  }

  // 月ごとの日数チェック
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // うるう年の判定
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  if (isLeapYear) {
    daysInMonth[1] = 29; // 2月を29日に更新
  }

  return day <= daysInMonth[month - 1];
};

export const createDeleteScheduleFromCommand = (text, currentYearMonth) => {
  // 1行目のみ抽出
  const firstLine = text.split('\n')[0].trim()
  // 連続した空白も1つとみなして空白で分割
  const splited = firstLine.split(/\s+/)
  const dateStr = splited.length > 1 ? `${currentYearMonth}-${splited[1]}` : undefined
  const title = splited.length > 2 ? splited[2] : undefined

  if (!title || !dateStr) {
    alert('タイトルまたは日時がありません')
    return null // タイトルまたは開始日時がない場合は無効
  }
  console.log("createDeleteScheduleFromCommand", `${currentYearMonth}-${splited[1]}`)
  if (!isValidYYYYMMDD(`${currentYearMonth}-${splited[1]}`)) {
    alert('日付の形式が正しくありません')
    return null // 日時の形式が正しくない場合は無効
  }
  return {
    id: null,
    title: sanitizeText(title),
    start: dateStr,
    end: null,
    allDay: null,
  }
}

const test = () => {
  const testCases = [
    '\\add titleText 2024/7/30/10:30 2024/7/30/10:30',
    '\\add titleText 2024/07/30/10:30 2024/7/30/10:30',
    '\\add titleText 2024/1/5/9:15',
    '\\add titleText 2024/12/25/23:59',
    '\\add titleText 2024/2/29/0:0',
    '\\add titleText 2024/6/15/12:5',
    '\\add titleText 2024/7/30',
    '\\add titleText 2024/07/30',
    '\\add titleText 2024/1/5',
    '\\add titleText 2024/12/25',
    '\\add titleText 2024/2/29',
    '\\add titleText 2024/6/15',
  ]

  testCases.forEach(testCase => {
    const result = createScheduleDataFromCommand(testCase);
    console.log(`"${testCase}" → `);
    console.log('%o', result);
  });
}


// テスト用
// test()
