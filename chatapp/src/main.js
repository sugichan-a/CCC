import { createApp } from "vue"
import "./style.css"
import App from "./App.vue"
import router from "./router"
import vuetify from "./plugins/vuetify"
import ganttastic from '@infectoone/vue-ganttastic'

createApp(App).use(vuetify).use(router).use(ganttastic).mount("#app")
