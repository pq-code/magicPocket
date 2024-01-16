const systemSettings = [
  {
    path: '/dashboard/webRtc',
    name: 'dashboard.webRtc',
    component: () =>
      import(/* webpackChunkName: "about" */ "@renderer/views/webRtc/webRtc.vue"),
    meta: { hidden: false, title: 'webRtc' }
  }
]
export default systemSettings
