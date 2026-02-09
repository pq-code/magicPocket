/**
 * 组件预览：展示组件信息 + 沙箱渲染预览
 */
import { defineComponent, computed } from 'vue';
import { ElButton, ElDescriptions, ElDescriptionsItem, ElCard, ElTag } from 'element-plus';
import { TypeRenderEngine } from '@renderer/internal/RenderEngine/components/TypeRenderEngine.jsx';

const ComponentPreview = defineComponent({
  name: 'ComponentPreview',
  props: {
    component: {
      type: Object,
      required: true
    }
  },
  emits: ['edit'],
  setup(props, { emit }) {
    // 获取来源类型标签
    const sourceTypeLabel = computed(() => {
      const sourceType = props.component.npm?.sourceType;
      const labels = {
        builtin: { text: '内置', type: 'info' },
        local: { text: '项目内', type: '' },
        npm: { text: 'NPM', type: 'success' },
        remote: { text: '远程', type: 'warning' },
        localFs: { text: '本地文件', type: 'primary' }
      };
      return labels[sourceType] || labels.local;
    });

    // 沙箱用单节点（将 ComponentMeta 转为画布节点形态）
    const previewNode = computed(() => ({
      type: props.component.type,
      key: `${props.component.type}-preview`,
      componentName: props.component.componentName,
      props: props.component.props || {},
      children: [],
      npm: props.component.npm
    }));

    const handleEdit = () => {
      emit('edit');
    };

    return () => (
      <div class="component-preview">
        {/* 基本信息 */}
        <ElCard class="info-card">
          <template v-slots={{ header: () => (
            <div class="card-header">
              <span>组件信息</span>
              <ElButton type="primary" size="small" onClick={handleEdit}>
                编辑
              </ElButton>
            </div>
          )}}>
            <ElDescriptions column={2} border>
              <ElDescriptionsItem label="类型">
                <code>{props.component.type}</code>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="名称">
                {props.component.componentName}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="分组">
                {props.component.group || '未分组'}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="来源">
                <ElTag type={sourceTypeLabel.value.type} size="small">
                  {sourceTypeLabel.value.text}
                </ElTag>
              </ElDescriptionsItem>
              {props.component.npm?.package && (
                <ElDescriptionsItem label="包名">
                  {props.component.npm.package}
                </ElDescriptionsItem>
              )}
              {props.component.npm?.exportName && (
                <ElDescriptionsItem label="导出名">
                  {props.component.npm.exportName}
                </ElDescriptionsItem>
              )}
              {props.component.npm?.localPath && (
                <ElDescriptionsItem label="本地路径" span={2}>
                  <code style="font-size: 12px;">{props.component.npm.localPath}</code>
                </ElDescriptionsItem>
              )}
              {props.component.npm?.url && (
                <ElDescriptionsItem label="远程URL" span={2}>
                  <code style="font-size: 12px;">{props.component.npm.url}</code>
                </ElDescriptionsItem>
              )}
            </ElDescriptions>
          </template>
        </ElCard>

        {/* Props 配置 */}
        {props.component.props && Object.keys(props.component.props).length > 0 && (
          <ElCard class="props-card" style="margin-top: 16px;">
            <template v-slots={{ header: () => <span>配置项 (Props)</span> }}>
              <pre class="props-json">{JSON.stringify(props.component.props, null, 2)}</pre>
            </template>
          </ElCard>
        )}

        {/* 沙箱预览：用 TypeRenderEngine 渲染单节点 */}
        <ElCard class="preview-card" style="margin-top: 16px;">
          <template v-slots={{ header: () => <span>沙箱预览</span> }}>
            <div class="preview-area preview-sandbox">
              {props.component.npm?.sourceType === 'localFs' ? (
                <div class="preview-placeholder">
                  <p>本地文件组件可将「编辑源码」保存后，在画布中拖入此组件预览</p>
                </div>
              ) : (
                TypeRenderEngine(previewNode.value, [])
              )}
            </div>
          </template>
        </ElCard>
      </div>
    );
  }
});

export default ComponentPreview;
