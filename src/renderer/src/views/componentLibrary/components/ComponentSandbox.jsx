/**
 * 组件沙箱预览：在隔离环境中渲染组件
 * 逻辑：ComponentMeta → previewNode → TypeRenderEngine(type/npm) → 内置生成器或动态加载 → 渲染
 * 切换组件时立即清空预览，加载失败则展示错误，不保留旧组件
 */
import { defineComponent, computed, ref, watch } from 'vue';
import { TypeRenderEngine } from '@renderer/packages/RenderEngine/components/TypeRenderEngine';
import { loadComponent } from '@renderer/core/loader';
import { getComponentNpm } from '@renderer/core/renderer/ComponentRegistry';

const ComponentSandbox = defineComponent({
  name: 'ComponentSandbox',
  props: {
    component: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    // displayState: 'loading' | 'ready' | 'error' — 切换组件时先置为 loading，永不展示旧组件
    const displayState = ref('loading');
    const error = ref(null);

    watch(
      () => [props.component?.type, props.component?.componentDir, props.component?.descriptorPath],
      async () => {
        // 1. 立即清空，不展示任何旧内容
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

    const previewNode = computed(() => ({
      type: props.component.type,
      key: `${props.component.type}-sandbox`,
      componentName: props.component.componentName,
      props: props.component.props || {},
      children: [],
      npm: props.component.npm
    }));

    const sandboxKey = computed(
      () =>
        `${props.component?.type ?? ''}-${props.component?.componentDir ?? ''}-${props.component?.descriptorPath ?? ''}`
    );

    return () => (
      <div class="component-sandbox">
        <div class="sandbox-render" key={sandboxKey.value}>
          {displayState.value === 'loading' && <div class="sandbox-loading">加载中...</div>}
          {displayState.value === 'error' && (
            <div class="render-error">
              <i class="iconfont icon-cuowu" style="font-size: 32px; color: #f56c6c;" />
              <p>渲染失败</p>
              <code>{error.value?.message}</code>
            </div>
          )}
          {displayState.value === 'ready' && TypeRenderEngine(previewNode.value, [])}
        </div>
      </div>
    );
  }
});

export default ComponentSandbox;
