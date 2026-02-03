import { createRouter, createWebHistory } from 'vue-router'
import draggingDragging from './branch/draggingDragging'

export const routerMap = [
  ...draggingDragging,
]
const router = {
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: "/dashboard",
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () =>
        import(/* webpackChunkName: "about" */ "@renderer/views/dashboard/dashboard.vue"),
      children: routerMap,
      meta: { hidden: false, title: "首页" },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import("@renderer/views/draggingDragging/draggingDragging.vue"),
      meta: {
        hidden: true,
        title: ('routes.basic.login'),
      },
    },
    // 以下路由已移至 routerMap，通过 dashboard 的 children 注册
    ...routerMap
  ]
}

const routers = createRouter(router)
console.log('router', router)
export default routers
