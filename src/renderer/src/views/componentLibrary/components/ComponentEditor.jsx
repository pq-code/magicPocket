/**
 * 组件编辑器：编辑组件 meta 信息
 */
import { defineComponent, ref, watch, computed } from 'vue';
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElButton,
  ElCard,
  ElRadioGroup,
  ElRadioButton,
  ElMessage
} from 'element-plus';

const ComponentEditor = defineComponent({
  name: 'ComponentEditor',
  props: {
    component: {
      type: Object,
      required: true
    }
  },
  emits: ['save', 'cancel'],
  setup(props, { emit }) {
    // 编辑表单数据
    const formData = ref({
      type: '',
      componentName: '',
      icon: '',
      group: '',
      description: '',
      tags: '',
      category: '',
      npm: {
        exportName: '',
        package: '',
        component: '',
        localPath: '',
        url: '',
        sourceType: 'local',
        destructuring: true
      }
    });
    
    // 监听组件变化，初始化表单
    watch(() => props.component, (comp) => {
      if (comp) {
        const tagsVal = comp.tags;
        formData.value = {
          type: comp.type || '',
          componentName: comp.componentName || '',
          icon: comp.icon || '',
          group: comp.group || '',
          description: comp.description || '',
          tags: Array.isArray(tagsVal) ? tagsVal.join(', ') : (typeof tagsVal === 'string' ? tagsVal : ''),
          category: comp.category || '',
          npm: {
            exportName: comp.npm?.exportName || comp.type || '',
            package: comp.npm?.package || '',
            component: comp.npm?.component || '',
            localPath: comp.npm?.localPath || '',
            url: comp.npm?.url || '',
            sourceType: comp.npm?.sourceType || 'local',
            destructuring: comp.npm?.destructuring ?? true
          }
        };
      }
    }, { immediate: true });
    
    // 来源类型
    const sourceType = computed({
      get: () => formData.value.npm.sourceType,
      set: (val) => { formData.value.npm.sourceType = val; }
    });
    
    // 分组选项
    const groupOptions = ['基础组件', '输入组件', '容器组件', '展示组件', '自定义组件'];
    
    // 保存
    const handleSave = () => {
      if (!formData.value.type) {
        ElMessage.warning('请填写组件类型');
        return;
      }
      if (!formData.value.componentName) {
        ElMessage.warning('请填写组件名称');
        return;
      }
      
      const tagsStr = (formData.value.tags || '').trim();
      const tags = tagsStr ? tagsStr.split(/[,，\s]+/).filter(Boolean) : undefined;

      const result = {
        ...props.component,
        type: formData.value.type,
        componentName: formData.value.componentName,
        icon: formData.value.icon,
        group: formData.value.group,
        description: formData.value.description || undefined,
        tags: tags,
        category: formData.value.category || undefined,
        npm: {
          exportName: formData.value.npm.exportName || formData.value.type,
          sourceType: formData.value.npm.sourceType,
          destructuring: formData.value.npm.destructuring
        }
      };
      
      // 根据来源类型设置对应字段
      switch (formData.value.npm.sourceType) {
        case 'local':
          result.npm.component = formData.value.npm.component;
          break;
        case 'npm':
          result.npm.package = formData.value.npm.package;
          break;
        case 'remote':
          result.npm.url = formData.value.npm.url;
          break;
        case 'localFs':
          result.npm.localPath = formData.value.npm.localPath;
          break;
      }
      
      emit('save', result);
    };
    
    // 取消
    const handleCancel = () => {
      emit('cancel');
    };
    
    return () => (
      <div class="component-editor">
        <ElCard>
          <template v-slots={{ header: () => (
            <div class="card-header">
              <span>编辑组件</span>
              <div>
                <ElButton onClick={handleCancel}>取消</ElButton>
                <ElButton type="primary" onClick={handleSave}>保存</ElButton>
              </div>
            </div>
          )}}>
            <ElForm labelWidth="100px" labelPosition="right">
              {/* 版本信息（只读） */}
              {(props.component?.materialVersion || props.component?.componentVersion || props.component?.id) && (
                <div class="form-section">
                  <div class="section-title">版本信息</div>
                  <div class="version-row">
                    {props.component.id && (
                      <span class="version-tag">ID: {props.component.id}</span>
                    )}
                    {props.component.materialVersion && (
                      <span class="version-tag">物料: {props.component.materialVersion}</span>
                    )}
                    {props.component.componentVersion && (
                      <span class="version-tag">组件: {props.component.componentVersion}</span>
                    )}
                  </div>
                </div>
              )}
              {/* 基本信息 */}
              <div class="form-section">
                <div class="section-title">基本信息</div>
                <ElFormItem label="组件类型" required>
                  <ElInput v-model={formData.value.type} placeholder="如: MyButton" />
                </ElFormItem>
                <ElFormItem label="组件名称" required>
                  <ElInput v-model={formData.value.componentName} placeholder="如: 自定义按钮" />
                </ElFormItem>
                <ElFormItem label="图标">
                  <ElInput v-model={formData.value.icon} placeholder="如: icon-anniu" />
                </ElFormItem>
                <ElFormItem label="分组">
                  <ElSelect v-model={formData.value.group} placeholder="选择分组" allowCreate filterable>
                    {groupOptions.map(opt => (
                      <ElOption key={opt} label={opt} value={opt} />
                    ))}
                  </ElSelect>
                </ElFormItem>
                <ElFormItem label="描述">
                  <ElInput v-model={formData.value.description} type="textarea" rows={2} placeholder="组件用途说明，便于搜索与 AI 识别" />
                </ElFormItem>
                <ElFormItem label="标签">
                  <ElInput v-model={formData.value.tags} placeholder="如: 表单, 搜索, ElementPlus，逗号分隔" />
                </ElFormItem>
                <ElFormItem label="类别">
                  <ElInput v-model={formData.value.category} placeholder="如: form | layout | data-display" />
                </ElFormItem>
              </div>
              
              {/* 加载配置 */}
              <div class="form-section">
                <div class="section-title">加载配置</div>
                <ElFormItem label="来源类型">
                  <ElRadioGroup v-model={sourceType.value}>
                    <ElRadioButton label="local">项目内</ElRadioButton>
                    <ElRadioButton label="npm">NPM</ElRadioButton>
                    <ElRadioButton label="remote">远程</ElRadioButton>
                    <ElRadioButton label="localFs">本地文件</ElRadioButton>
                  </ElRadioGroup>
                </ElFormItem>
                
                <ElFormItem label="导出名">
                  <ElInput v-model={formData.value.npm.exportName} placeholder="如: MyButton" />
                </ElFormItem>
                
                {/* 项目内组件 */}
                {sourceType.value === 'local' && (
                  <ElFormItem label="组件路径">
                    <ElInput v-model={formData.value.npm.component} placeholder="如: packages/MyButton/index.jsx" />
                  </ElFormItem>
                )}
                
                {/* NPM 组件 */}
                {sourceType.value === 'npm' && (
                  <ElFormItem label="包名">
                    <ElInput v-model={formData.value.npm.package} placeholder="如: element-plus" />
                  </ElFormItem>
                )}
                
                {/* 远程组件 */}
                {sourceType.value === 'remote' && (
                  <ElFormItem label="远程URL">
                    <ElInput v-model={formData.value.npm.url} placeholder="如: https://cdn.example.com/my-button.esm.js" />
                  </ElFormItem>
                )}
                
                {/* 本地文件组件 */}
                {sourceType.value === 'localFs' && (
                  <ElFormItem label="本地路径">
                    <ElInput v-model={formData.value.npm.localPath} placeholder="如: /Users/xxx/components/MyButton/index.vue" />
                  </ElFormItem>
                )}
              </div>
            </ElForm>
          </template>
        </ElCard>
      </div>
    );
  }
});

export default ComponentEditor;
