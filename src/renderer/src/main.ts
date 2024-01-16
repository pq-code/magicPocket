// import './assets/main.css'

import { createApp } from 'vue'

import App from './App.vue'
import router from './router/index.js'

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

import './assets/iconfont/iconfont.css'

const app = createApp(App)

app.use(router)
app.use(ElementPlus, { locale: zhCn });
app.mount('#app')

// 去除控制台警告⚠
app.config.warnHandler = () => null
