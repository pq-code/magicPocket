const ssh = [
  {
    path: '/dashboard/ssh',
    name: 'dashboard.linkSsh',
    component: () =>
      import(/* webpackChunkName: "about" */ "@renderer/views/ssh/linkSsh.vue"),
    meta: { hidden: false, title: 'linkSsh' }
  }
]
export default ssh
