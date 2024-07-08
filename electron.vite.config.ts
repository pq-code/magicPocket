// import { resolve } from 'path'
import path from 'path'

import { defineConfig, externalizeDepsPlugin, bytecodePlugin } from 'electron-vite'

import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

import AutoImport from 'unplugin-auto-import/vite' // 自动引入
import Components from 'unplugin-vue-components/vite'// 自动注册
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

const pathSrc = path.resolve(__dirname, 'src')

export default defineConfig({
  // main: {
  //   plugins: [externalizeDepsPlugin(), bytecodePlugin()]
  // },
  preload: {
    plugins: []
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': path.resolve('src/renderer/src')
      }
    },
    plugins: [
      vue(),
      vueJsx(),
      externalizeDepsPlugin(),
      bytecodePlugin(),
      AutoImport({
        imports: ["vue", "vue-router", "pinia",],
        // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox... (带样式)
        resolvers: [
          ElementPlusResolver(),
          // Auto import icon components
          // 自动导入图标组件
          IconsResolver({
            prefix: 'Icon',
          }),
        ],
        dts: path.resolve(pathSrc, 'auto-imports.d.ts'),
      }),
      Icons({
        autoInstall: true,
      }),
      Components({
        resolvers: [
          // Auto register icon components
          // 自动注册图标组件
          IconsResolver({
            enabledCollections: ['ep'],
          }),
          // Auto register Element Plus components
          // 自动导入 Element Plus 组件
          ElementPlusResolver(),
        ],
        dts: path.resolve(pathSrc, 'components.d.ts'),
      }),],
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
