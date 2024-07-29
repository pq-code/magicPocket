// import './assets/main.css'

import { createApp } from 'vue'

import App from './App.vue'
import router from './router/index.js'
import store from '@renderer/stores'

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import quadraticSpaceBag from "@renderer/packages";

import './assets/iconfont/iconfont.css'

const app = createApp(App)

app.use(router)
app.use(store)
app.use(ElementPlus, { locale: zhCn });
app.use(quadraticSpaceBag)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.mount('#app')

// 去除控制台警告⚠
app.config.warnHandler = () => null
