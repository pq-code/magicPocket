import { createRouter, createWebHistory } from 'vue-router'
import systemSettings from './branch/systemSettings'
import ssh from './branch/ssh'
import draggingDragging from './branch/draggingDragging'
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
      redirect: "/dashboard/ssh",
      component: () =>
        import(/* webpackChunkName: "about" */ "@renderer/views/dashboard/dashboard.vue"),
      children: [
        ...systemSettings,
        ...ssh,
        ...draggingDragging
      ],
      meta: { hidden: false, title: "首页" },
    },
    {
      path: "/draggingDragging",
      name: "draggingDragging",
      component: () =>
        import(/* webpackChunkName: "about" */ "@renderer/views/draggingDragging/draggingDragging.vue"),
      meta: { hidden: false, title: "首页" },
    },
  ]
}

const routers = createRouter(router)
console.log('router', router)
export default routers
