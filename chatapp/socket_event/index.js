// メッセージを保存する配列
const chatRoomState = {
  messages: [
  {
    id: '4dea55cf-68fd-449d-81e0-b5cfccf18cc5',
    postedAt: '2025-08-01T04:41:01.166Z',
    user: '清水あきら',
    message: 'vue 楽しい'
  },
  {
    id: '18981767-1908-4900-9706-ebcaff57c39e',
    postedAt: '2025-08-01T04:41:09.187Z',
    user: '松本昌亮',
    message: 'Vue 楽しい'
  },
  {
    id: 'a6c743f8-6cb1-4149-8634-ac9bb6323d3d',
    postedAt: '2025-08-01T04:41:31.017Z',
    user: '松本昌亮',
    message: 'Vue 頑張ろう'
  }
],
  schedules: [
    {
    type: 'addSchedule',
    user: '天満亮太',
    data: {
      id: '63a0e805-535e-4c30-9757-85b69ce927fe',
      title: 'UI & UX設計',
      start: '2025-08-04',
      end: '2025-08-06',
      allDay: true
    }},
    {
    type: 'addSchedule',
    user: '天満亮太',
    data: {
      id: '333475b8-0047-4459-be0b-61380b0565dd',
      title: '実装フェーズA',
      start: '2025-08-07',
      end: '2025-08-09',
      allDay: true
    }},
    {
    type: 'addSchedule',
    user: '天満亮太',
    data: {
      id: '3dfefb92-1d9c-4b78-85e7-e66afa813a4f',
      title: '環境構築（Vue）',
      start: '2025-08-01T14:00:00',
      end: '2025-08-01T18:00:00',
      allDay: false
    }},
    {
    type: 'addSchedule',
    user: '天満亮太',
    data: {
      id: 'bd800f17-c518-48e8-9e5b-62215ba3f8fc',
      title: '中間レビュー',
      start: '2025-08-10',
      allDay: true
    }},
     {
    type: 'addSchedule',
    user: '天満亮太',
    data: {
      id: 'e6666448-885c-4f76-a9b0-cc409a91a0a6',
      title: '要件定義',
      start: '2025-08-01',
      end: '2025-08-03',
      allDay: true
    }},


  ],
  users: [],
}

const userNames = new Set();

export default (io, socket) => {

  let currentUserName = null;

  socket.on("setUserNameEvent", (userName) => {
    if (userNames.has(userName)) {
      socket.emit("userNameError", "このユーザー名は既に使用されています。");
      return;
    }

    userNames.add(userName);
    currentUserName = userName;
    console.log("ユーザー登録:", userName);

    const newUser = {
      name: userName,
      enteredAt: new Date().toISOString(),
    }
    chatRoomState.users.push(newUser);

    // ユーザー名が設定されたことをクライアントに通知
    socket.emit("userNameOK");
  });

  // 入室メッセージをクライアントに送信する
  socket.on("enterEvent", (data) => {
    socket.broadcast.emit("enterEvent", data)
  })

  // 退室メッセージをクライアントに送信する
  socket.on("exitEvent", (data, userName) => {
    if (userName) {
      userNames.delete(userName); // 退室したユーザー名を解放
      console.log("ユーザー退室:", userName);
      chatRoomState.users = chatRoomState.users.filter(user => user.name !== userName);
    }
    socket.broadcast.emit("exitEvent", data)
  })

  // 投稿メッセージを送信する
  socket.on("sendMessageEvent", (data) => {
    if (!data) {
      console.error("sendMessageEvent: data is empty")
      return
    }
    console.log("sendMessageEvent", data)

    switch (data.type) {
      case 'addMessage':
        // メッセージを配列に追加する
        console.log("Adding message:", data);
        chatRoomState.messages.push(data.data);
        break;
      case 'addSchedule':
        // スケジュールを配列に追加する
        console.log("Adding schedule:", data);
        // 重複チェック
        const newSchedule = data.data;
        const newDate = new Date(newSchedule.start).toDateString(); // 日付のみ取得

        const isDuplicate = chatRoomState.schedules.some(storedScheduleItem => {
          const storedDate = new Date(storedScheduleItem.data.start).toDateString();
          return storedDate === newDate &&
            storedScheduleItem.user === data.user &&
            storedScheduleItem.data.title === newSchedule.title;
        });
        if (isDuplicate) {
          socket.emit("errorMessage", "同じ日時に同じタイトルのスケジュールは追加できません");
          return;
        }

        chatRoomState.schedules.push(data);
        break;
      case 'deleteSchedule':
        // スケジュールを削除する
        const userName = data.user;
        const targetDate = data.data.start

        const idsToDelete = chatRoomState.schedules
          .filter(s => {
            const startDate = s.data.start.slice(0, 10)
            return (
              (s.user === userName) &&
              (s.data.title.includes(data.data.title)) &&
              (startDate === targetDate)
            )
          })
          .map(s => s.id)

        if (idsToDelete.length > 0) {
          chatRoomState.schedules = chatRoomState.schedules.filter(s => !idsToDelete.includes(s.id))
          console.log(`🗑️ ${idsToDelete.length} 件のイベントを削除しました (${targetDate})`)
        } else {
          console.log(`⚠️ ${targetDate} に一致するイベントが見つかりませんでした`)
        }
        break;
      default:
        console.warn("Unknown message type:", data.type);
    }

    // 全メッセージ配列をクライアントに送信
    io.sockets.emit("publishEvent", chatRoomState)
  })

  // 初回メッセージリクエストに対応
  socket.on("requestInitialMessages", () => {
    console.log("requestInitialMessages received, sending messages:", chatRoomState)
    socket.emit("publishEvent", chatRoomState)
  })

  // 新しいクライアントが接続した時に既存のメッセージを送信
  socket.emit("publishEvent", chatRoomState)
}