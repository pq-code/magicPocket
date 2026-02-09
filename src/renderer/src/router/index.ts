import { createRouter, createWebHistory } from 'vue-router'
import draggingDragging, { standaloneRoutes, navItems } from './branch/draggingDragging'

export { navItems }
export const routerMap = draggingDragging

const router = {
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      redirect: { name: 'lowCodeHome' },
      component: () =>
        import(/* webpackChunkName: "about" */ "@renderer/views/dashboard/dashboard.vue"),
      children: draggingDragging,
      meta: { hidden: false, title: '首页' },
    },
    ...standaloneRoutes,
    {
      path: '/login',
      name: 'login',
      component: () => import("@renderer/views/draggingDragging/draggingDragging.vue"),
      meta: {
        hidden: true,
        title: ('routes.basic.login'),
      },
    },
  ]
}

const routers = createRouter(router)
console.log('router', router)
export default routers
