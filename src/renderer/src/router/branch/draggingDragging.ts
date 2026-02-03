/**
 * 低代码平台相关路由
 * 这些路由会显示在 dashboard 侧边栏菜单中
 */
const draggingDragging = [
  {
    path: '/draggingDragging',
    name: 'draggingDragging',
    component: () =>
      import(/* webpackChunkName: "about" */ "@renderer/views/draggingDragging/draggingDragging.vue"),
    meta: { 
      hidden: false, 
      title: '低代码平台',
      icon: 'icon-bianji' // 编辑图标
    }
  },
  {
    path: '/componentLibrary',
    name: 'componentLibrary',
    component: () =>
      import("@renderer/views/componentLibrary/componentLibrary.vue"),
    meta: { 
      hidden: false, 
      title: '本地组件库',
      icon: 'icon-zujian' // 组件图标
    }
  }
]
export default draggingDragging
