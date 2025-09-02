import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import socketIoPlugin from "./plugins/socket.io.plugin";
import socketEvents from "./socket_event";
import fs from "fs"; // fsモジュールをインポート
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      vue(),
      socketIoPlugin({ socketEvents }),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true,
        },
        manifest: {
          name: 'CCC',
          short_name: 'CCC',
          description: 'コマンド操作カレンダー機能付きのチャットアプリです.',
          theme_color: '#ff9a07',
          background_color: '#162432',
          display: 'standalone',
          "icons": [
            {
              "src": "pwa-64x64.png",
              "sizes": "64x64",
              "type": "image/png"
            },
            {
              "src": "pwa-192x192.png",
              "sizes": "192x192",
              "type": "image/png"
            },
            {
              "src": "pwa-512x512.png",
              "sizes": "512x512",
              "type": "image/png"
            },
            {
              "src": "maskable-icon-512x512.png",
              "sizes": "512x512",
              "type": "image/png",
              "purpose": "maskable"
            }
          ]
        },
      }),
    ],
    server: {
      host: true,
      port: parseInt(env.PORT) || 3000,
      strictPort: true,
      // https: { // HTTPS設定を追加
      //   key: fs.readFileSync("/etc/ssl/private.key"), // 秘密鍵のパス
      //   cert: fs.readFileSync("/etc/ssl/certificate.crt") // 証明書のパス
      // }
    }
  };
});
