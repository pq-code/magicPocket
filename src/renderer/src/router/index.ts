import { createRouter, createWebHistory } from 'vue-router'
import systemSettings from './branch/systemSettings'
import ssh from './branch/ssh'

import draggingDragging from './branch/draggingDragging'

export const routerMap = [
  ...systemSettings,
  ...ssh,
  ...draggingDragging
]
const router = {
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: "/draggingDragging",
    },
    {
      path: "/dashboard",
      name: "dashboard",
      // redirect: "/draggingDragging",
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
    {
      path: '/draggingDragging',
      name: 'draggingDragging',
      component: () =>
        import(/* webpackChunkName: "about" */ "@renderer/views/draggingDragging/draggingDragging.vue"),
      meta: { hidden: false, title: '低代码平台' }
    }
  ]
}

const routers = createRouter(router)
console.log('router', router)
export default routers
