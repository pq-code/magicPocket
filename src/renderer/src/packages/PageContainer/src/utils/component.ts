import { createApp } from 'vue'

const app = createApp({})

// 自动注册
export const customComponent = async(item) => {
  const name = item.npm.exportName // 组件名称
  // const main = item.npm.main // 组件名称
  const package = '@renderer/packages'
  console.log(package)
  debugger
  // const component = await import(/* @vite-ignore */ `${main}`)
  // const component = await import('@renderer/packages')
  const component = import.meta.glob(package);
  debugger
  app.component(name,component[package])
}

