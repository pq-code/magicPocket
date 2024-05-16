import { createRouter, createWebHistory } from 'vue-router'
import systemSettings from './branch/systemSettings'
import ssh from './branch/ssh'
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
      redirect: "/dashboard/ssh",
      component: () =>
        import(/* webpackChunkName: "about" */ "@renderer/views/dashboard/dashboard.vue"),
      // leaf: true,//只有一个节点
      children: [
        ...systemSettings,
        ...ssh
      ],
      meta: { hidden: false, title: "首页" },
    }
  ]
}
const routers = createRouter(router)
console.log('router', router)
export default routers
