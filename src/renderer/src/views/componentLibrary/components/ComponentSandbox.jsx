/**
 * 组件沙箱预览：在隔离环境中渲染组件 + 操作区（控制面板）
 * 预览区域包含：组件渲染 | 操作区（根据 meta.props 动态渲染）
 */
import { defineComponent, computed, ref, watch, reactive } from 'vue';
import { TypeRenderEngine } from '@renderer/internal/RenderEngine/components/TypeRenderEngine.jsx';
import { loadComponent } from '@renderer/core/loader';
import { getComponentNpm } from '@renderer/core/renderer/ComponentRegistry';
import ControlPanel from '@renderer/internal/ControlPanel/src/controlPanel.jsx';

function deepCloneProps(obj) {
  if (obj == null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepCloneProps);
  const out = {};
  for (const k of Object.keys(obj)) {
    out[k] = deepCloneProps(obj[k]);
  }
  return out;
}

const ComponentSandbox = defineComponent({
  name: 'ComponentSandbox',
  props: {
    component: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const displayState = ref('loading');
    const error = ref(null);
    // 可编辑的预览节点（响应式，供 ControlPanel 与渲染器共用）
    const previewItem = reactive({
      type: '',
      key: '',
      componentName: '',
      props: {},
      children: [],
      npm: null,
      // Table 等组件可能依赖 item.data
      data: undefined
    });

    watch(
      () => [props.component?.type, props.component?.componentDir, props.component?.descriptorPath],
      async () => {
        displayState.value = 'loading';
        error.value = null;

        const comp = props.component;
        if (!comp) return;

        const npm = comp.npm ?? getComponentNpm(comp.type);
        if (!npm) {
          displayState.value = 'error';
          error.value = new Error('未配置组件');
          return;
        }

        Object.assign(previewItem, {
          type: comp.type,
          key: `${comp.type}-sandbox`,
          componentName: comp.componentName,
          props: deepCloneProps(comp.props || {}),
          children: [],
          npm: comp.npm,
          data: deepCloneProps(comp.data)
        });

        try {
          await loadComponent(npm);
          displayState.value = 'ready';
        } catch (e) {
          displayState.value = 'error';
          error.value = e;
        }
      },
      { immediate: true }
    );

    const sandboxKey = computed(
      () =>
        `${props.component?.type ?? ''}-${props.component?.componentDir ?? ''}-${props.component?.descriptorPath ?? ''}`
    );

    return () => (
      <div class="component-sandbox-with-panel">
        <div class="sandbox-preview-area">
          <div class="sandbox-render" key={sandboxKey.value}>
            {displayState.value === 'loading' && <div class="sandbox-loading">加载中...</div>}
            {displayState.value === 'error' && (
              <div class="render-error">
                <i class="iconfont icon-cuowu" style="font-size: 32px; color: #f56c6c;" />
                <p>渲染失败</p>
                <code>{error.value?.message}</code>
              </div>
            )}
            {displayState.value === 'ready' && TypeRenderEngine(previewItem, [])}
          </div>
        </div>
        <div class="sandbox-panel-area">
          <div class="panel-label">操作区</div>
          <ControlPanel item={previewItem} class="sandbox-control-panel" />
        </div>
      </div>
    );
  }
});

export default ComponentSandbox;
