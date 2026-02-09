/**
 * 低代码平台相关路由
 * - lowCodeHome: 首页，在 dashboard 导航容器内
 * - draggingDragging、componentLibrary: 独立全屏，不在导航容器内
 */
/** 首页（在 dashboard 内） */
export const lowCodeHomeRoute = {
  path: '/lowCodeHome',
  name: 'lowCodeHome',
  component: () => import("@renderer/views/lowCodeHome/lowCodeHome.vue"),
  meta: { hidden: false, title: '首页', icon: 'icon-yingyongruanjian' }
}

/** 侧边栏导航项（首页在 dashboard 内，组件库为独立页面） */
export const navItems = [
  { path: '/lowCodeHome', name: 'lowCodeHome', meta: { title: '首页', icon: 'icon-yingyongruanjian' } },
  { path: '/componentLibrary', name: 'componentLibrary', meta: { title: '本地组件库', icon: 'icon-zujian' } },
]

/** 独立全屏路由（不嵌套在 dashboard 内） */
export const standaloneRoutes = [
  {
    path: '/draggingDragging',
    name: 'draggingDragging',
    component: () =>
      import(/* webpackChunkName: "dragging" */ "@renderer/views/draggingDragging/draggingDragging.vue"),
    meta: { hidden: true, title: '低代码编辑' }
  },
  {
    path: '/lowcode/preview',
    name: 'lowCodePreview',
    component: () =>
      import(/* webpackChunkName: "dragging" */ "@renderer/views/draggingDragging/lowCodePreview.vue"),
    meta: { hidden: true, title: '低代码预览' }
  },
  {
    path: '/componentLibrary',
    name: 'componentLibrary',
    component: () =>
      import("@renderer/views/componentLibrary/componentLibrary.vue"),
    meta: { hidden: true, title: '本地组件库' }
  }
]

const draggingDragging = [lowCodeHomeRoute]
export default draggingDragging
