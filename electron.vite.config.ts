import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin, bytecodePlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), bytecodePlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin(), bytecodePlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [vue()],
    //本地运行配置，以及反向代理配置
    server: {
      port: 7000,//端口
      host: true,
      open: false,//服务启动时自动在浏览器中打开应用
      // 反向代理配置
      proxy: { //配置多个代理
        '/api': {
          // target: "http://192.168.6.43:8300/",
          target: "http://121.40.249.116:8300/",
          changeOrigin: true, ///设置访问目标地址允许跨域
          rewrite: (p) => p.replace(/^\/api/, '')
        },
        '/region': {
          target: "http://47.99.91.120:8040/",
          changeOrigin: true, ///设置访问目标地址允许跨域
          rewrite: (p) => p.replace(/^\/region/, '')
        },


      }
    },
  },

})
