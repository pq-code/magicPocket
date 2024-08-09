const spaceDisplay = [
  {
    path: '/spaceDisplay',
    name: 'spaceDisplay',
    component: () =>
      import(/* webpackChunkName: "about" */ "@renderer/views/spaceDisplay/src/spaceDisplay.jsx"),
    meta: { hidden: false, title: '空间展示' }
  }
]
export default spaceDisplay
