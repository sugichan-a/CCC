import { createRouter, createWebHistory } from "vue-router"
import ChatLayout from "../components/ChatLayout.vue"
import Login from "../components/Login.vue"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "login",
      component: Login
    }, {
      path: "/chat/",
      name: "chat",
      component: ChatLayout,
      beforeEnter: (to, from, next) => {
        if (from.name === "login") {
          next()
        } else {
          next({ name: "login" })
        }
      },
    }
  ],
})

export default router