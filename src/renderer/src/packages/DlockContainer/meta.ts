/**
 * DlockContainer (div容器) 组件物料描述
 * 参考设计软件：组件 Tab = 位置/布局（宽高仅此处）；样式 Tab = 圆角/图层/填充/描边/特效
 */
export const Container = {
  componentName: 'div容器',
  type: 'container',
  icon: 'icon-fuxuankuangkong',
  group: '基础组件',
  npm: {
    exportName: 'DlockContainer',
    package: '@renderer/packages',
    destructuring: true
  },
  props: {
    /** 【组件】位置：X/Y、宽高(W/H)、旋转/翻转，宽高只在此处 */
    positionProps: {
      title: '位置',
      children: [
        { label: 'X', type: 'input', value: '', key: 'left', rightText: 'px' },
        { label: 'Y', type: 'input', value: '', key: 'top', rightText: 'px' },
        { label: '宽度 W', type: 'input', value: '', key: 'width', placeholder: '如: 100%, 200px, 50vw' },
        { label: '高度 H', type: 'input', value: '', key: 'height', placeholder: '如: 100%, 200px, 50vh' },
        { label: '旋转', type: 'input', value: '', key: 'rotate', rightText: '°' },
        { label: '水平翻转', type: 'segmented', value: '', key: 'scaleX', options: [{ label: '否', value: '' }, { label: '是', value: '-1' }] },
        { label: '垂直翻转', type: 'segmented', value: '', key: 'scaleY', options: [{ label: '否', value: '' }, { label: '是', value: '-1' }] }
      ],
      style: {}
    },
    /** 【组件】布局：display + flex/grid，showWhen 控制按布局方式只显示对应项 */
    layoutProps: {
      title: '布局',
      children: [
        { label: '布局方式', type: 'segmented', value: '', key: 'display', options: [{ label: 'block', value: 'block' }, { label: 'flex', value: 'flex' }, { label: 'grid', value: 'grid' }], showWhen: 'all' },
        { label: 'flex-direction', type: 'segmented', value: '', key: 'flexDirection', options: [{ label: 'row', value: 'row' }, { label: 'column', value: 'column' }, { label: 'row-reverse', value: 'row-reverse' }, { label: 'column-reverse', value: 'column-reverse' }], showWhen: 'flex' },
        { label: 'flex-wrap', type: 'segmented', value: '', key: 'flexWrap', options: [{ label: 'nowrap', value: 'nowrap' }, { label: 'wrap', value: 'wrap' }], showWhen: 'flex' },
        { label: 'justify-content', type: 'segmented', value: '', key: 'justifyContent', options: [{ label: '左', value: 'flex-start' }, { label: '中', value: 'center' }, { label: '右', value: 'flex-end' }, { label: '两端', value: 'space-between' }, { label: '均分', value: 'space-evenly' }], showWhen: 'flex' },
        { label: 'align-items', type: 'segmented', value: '', key: 'alignItems', options: [{ label: '上', value: 'flex-start' }, { label: '中', value: 'center' }, { label: '下', value: 'flex-end' }, { label: '拉伸', value: 'stretch' }], showWhen: 'flex' },
        { label: 'align-content', type: 'segmented', value: '', key: 'alignContent', options: [{ label: '默认', value: 'normal' }, { label: '上', value: 'flex-start' }, { label: '中', value: 'center' }, { label: '下', value: 'flex-end' }, { label: '两端', value: 'space-between' }, { label: '拉伸', value: 'stretch' }], showWhen: 'flex' },
        { label: 'gap', type: 'input', value: '', key: 'gap', placeholder: '如: 10px, 1em', showWhen: 'flexGrid' },
        { label: 'grid-template-columns', type: 'input', value: '', key: 'gridTemplateColumns', placeholder: '如: 1fr 1fr, repeat(3, 1fr)', showWhen: 'grid' },
        { label: 'grid-template-rows', type: 'input', value: '', key: 'gridTemplateRows', placeholder: '如: auto 1fr, repeat(2, 100px)', showWhen: 'grid' },
        { label: '内间距', type: 'input', value: '10', key: 'padding', placeholder: '如: 10px, 2rem' },
        { label: '外间距', type: 'input', value: '', key: 'margin', placeholder: '如: 10px, 2rem' },
        { label: '滚动', type: 'segmented', value: '', key: 'overflow', options: [{ label: '是', value: 'auto' }, { label: '否', value: 'visible' }], showWhen: 'all' },
        { label: 'className', type: 'input', value: '', key: 'className', showWhen: 'all' }
      ],
      style: {}
    },
    /** 【样式】圆角 */
    radiusProps: {
      title: '圆角',
      children: [
        { label: '圆角', type: 'input', value: '', key: 'csborderRadius', placeholder: '如: 10px, 50%' }
      ],
      style: {}
    },
    /** 【样式】图层 */
    layerProps: {
      title: '图层',
      children: [
        { label: '透明度', type: 'input', value: '', key: 'csopacity', placeholder: '0-1' },
        { label: '显示', type: 'segmented', value: '', key: 'csvisibility', options: [{ label: '显示', value: 'visible' }, { label: '隐藏', value: 'hidden' }] }
      ],
      style: {}
    },
    /** 【样式】填充 */
    fillProps: {
      title: '填充',
      children: [
        { label: '背景色', type: 'color', value: '', key: 'csbackgroundColor' }
      ],
      style: {}
    },
    /** 【样式】描边 */
    strokeProps: {
      title: '描边',
      children: [
        { label: '边框宽度', type: 'input', value: '', key: 'csborderWidth', placeholder: '如: 1px, 2px' },
        { label: '边框颜色', type: 'color', value: '', key: 'csborderColor' },
        { label: '边框样式', type: 'segmented', value: '', key: 'csborderStyle', options: [{ label: '实线', value: 'solid' }, { label: '虚线', value: 'dashed' }, { label: '无', value: 'none' }] },
        {
          label: '描边位置',
          type: 'segmented',
          value: 'all',
          key: 'csborderPosition',
          options: [
            { label: '四边', value: 'all' },
            { label: '上', value: 'top' },
            { label: '右', value: 'right' },
            { label: '下', value: 'bottom' },
            { label: '左', value: 'left' }
          ]
        }
      ],
      style: {}
    },
    /** 【样式】特效 */
    effectsProps: {
      title: '特效',
      children: [
        { label: '外阴影', type: 'input', value: '', key: 'csboxShadow', placeholder: '如: 0 2px 8px rgba(0,0,0,0.15)' },
        { label: '内阴影', type: 'input', value: '', key: 'csboxShadowInner', placeholder: '如: inset 0 0 10px' }
      ],
      style: {}
    },
    /** 文字：div 内第一块文字区域（可当区块标题用），样式可单独调，符合 div 灵活性 */
    titleProps: {
      title: '文字',
      children: [
        { label: '文字', type: 'input', value: '', key: 'title' },
        { label: '高度', type: 'input', value: '', key: 'csheight', placeholder: '如: 30px, 2rem' },
        { label: '文字大小', type: 'input', value: '16', key: 'csfontSize', placeholder: '如: 16px, 1.2rem' },
        { label: '字重', type: 'segmented', value: '', key: 'csfontWeight', options: [{ label: '常规', value: '400' }, { label: '加粗', value: '600' }, { label: '粗体', value: '700' }] },
        { label: '颜色', type: 'color', value: '', key: 'cscolor' },
        { label: '对齐', type: 'segmented', value: 'left', key: 'cstextAlign', options: [{ label: '左', value: 'left' }, { label: '中', value: 'center' }, { label: '右', value: 'right' }] },
        { label: '内间距', type: 'input', value: '', key: 'cspadding', placeholder: '如: 0 0 8px 0' },
        { label: '外间距', type: 'input', value: '', key: 'csmargin', placeholder: '如: 0 0 12px 0' },
        { label: '左边框宽', type: 'input', value: '', key: 'csborderLeftWidth', placeholder: '如: 4px' },
        { label: '左边框色', type: 'color', value: '', key: 'csborderLeftColor' },
        { label: 'className', type: 'input', value: '', key: 'className' }
      ],
      style: {}
    },
    className: 'container',
    style: ''
  },
  children: []
}
