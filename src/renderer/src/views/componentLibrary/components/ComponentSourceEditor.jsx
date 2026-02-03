/**
 * 组件源码编辑器：读取/编辑组件文件，按文件类型高亮代码
 */
import { defineComponent, ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { ElButton, ElMessage } from 'element-plus'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('css', css)

/** 根据文件名推断高亮语言 */
function getLanguage(filePath) {
  if (!filePath) return 'plaintext'
  const name = filePath.split('/').pop() || ''
  if (name === 'meta.ts') return 'json'
  const ext = name.split('.').pop()?.toLowerCase()
  const map = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    vue: 'xml',
    json: 'json',
    less: 'css',
    scss: 'css',
    sass: 'css'
  }
  return map[ext] || 'plaintext'
}

const ComponentSourceEditor = defineComponent({
  name: 'ComponentSourceEditor',
  props: {
    component: {
      type: Object,
      required: true
    },
    filePath: {
      type: String,
      default: ''
    },
    isDescriptor: {
      type: Boolean,
      default: false
    }
  },
  emits: ['saved'],
  setup(props, { emit }) {
    const sourceContent = ref('')
    const loading = ref(false)
    const saving = ref(false)
    const currentPath = ref('')
    const textareaRef = ref(null)
    const highlightRef = ref(null)

    const actualPath = computed(() => {
      // 有明确路径时优先使用（descriptorPath 或 filePath）
      if (props.filePath) return props.filePath
      if (props.isDescriptor && props.component?.descriptorPath) {
        return props.component.descriptorPath
      }
      if (props.isDescriptor && props.component?.npm?.localPath) {
        const entryPath = props.component.npm.localPath
        const parts = entryPath.split('/')
        parts.pop()
        if (parts[parts.length - 1] === 'src') parts.pop()
        return parts.join('/') + '/meta.ts'
      }
      return props.component?.npm?.localPath || ''
    })

    const loadSource = async () => {
      const path = actualPath.value;
      if (!path || !window.electronAPI?.readComponentSource) {
        sourceContent.value = props.isDescriptor 
          ? JSON.stringify(props.component, null, 2)
          : '// 无法读取：无本地路径或 Electron API 不可用';
        currentPath.value = path;
        return;
      }
      currentPath.value = path;
      loading.value = true;
      try {
        sourceContent.value = await window.electronAPI.readComponentSource(path);
      } catch (e) {
        if (props.isDescriptor) {
          // 如果是描述文件但不存在，显示当前组件的 JSON
          sourceContent.value = JSON.stringify(props.component, null, 2);
        } else {
          sourceContent.value = `// 读取失败: ${e?.message || e}`;
        }
      } finally {
        loading.value = false;
      }
    };

    const saveSource = async () => {
      if (!currentPath.value || !window.electronAPI?.writeComponentSource) {
        ElMessage.warning('无法保存');
        return;
      }
      saving.value = true;
      try {
        await window.electronAPI.writeComponentSource(currentPath.value, sourceContent.value);
        ElMessage.success('保存成功');
        emit('saved');
      } catch (e) {
        ElMessage.error(`保存失败: ${e?.message || e}`);
      } finally {
        saving.value = false;
      }
    };

    // 快捷键保存
    const handleKeydown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveSource();
      }
    };

    const language = computed(() => getLanguage(currentPath.value))

    const highlightedHtml = computed(() => {
      const code = sourceContent.value
      const lang = language.value
      if (!code) return ''
      if (lang === 'plaintext') return escapeHtml(code)
      try {
        const r = hljs.highlight(code, { language: lang, ignoreIllegals: true })
        return r.value
      } catch {
        return escapeHtml(code)
      }
    })

    function escapeHtml(text) {
      const div = document.createElement('div')
      div.textContent = text
      return div.innerHTML
    }

    const onScroll = () => {
      const ta = textareaRef.value
      const pre = highlightRef.value
      if (ta && pre) {
        pre.scrollTop = ta.scrollTop
        pre.scrollLeft = ta.scrollLeft
      }
    }

    onMounted(() => {
      const ta = textareaRef.value
      if (ta) ta.addEventListener('scroll', onScroll)
    })
    onUnmounted(() => {
      const ta = textareaRef.value
      if (ta) ta.removeEventListener('scroll', onScroll)
    })

    watch([() => props.component, () => props.filePath, () => props.isDescriptor], loadSource, { immediate: true })

    return () => (
      <div class="source-editor-container">
        <div class="editor-toolbar">
          <div class="toolbar-left">
            <span class="file-name">{currentPath.value?.split('/').pop() || '未选择文件'}</span>
            <span class="file-lang">{language.value}</span>
          </div>
          <div class="toolbar-right">
            <ElButton loading={loading.value} size="small" text onClick={loadSource}>
              <i class="iconfont icon-shuaxin" style="margin-right: 4px;" />
              重新加载
            </ElButton>
            <ElButton type="primary" loading={saving.value} size="small" onClick={saveSource}>
              <i class="iconfont icon-baocun" style="margin-right: 4px;" />
              保存
            </ElButton>
          </div>
        </div>

        <div class="editor-content">
          <div class="line-numbers">
            {sourceContent.value.split('\n').map((_, i) => (
              <div key={i} class="line-number">{i + 1}</div>
            ))}
          </div>
          <div class="editor-mirror">
            <pre ref={highlightRef} class="highlight-pre" data-lang={language.value}>
              <code class="hljs" v-html={highlightedHtml.value} />
            </pre>
            <textarea
              ref={textareaRef}
              class="code-textarea"
              v-model={sourceContent.value}
              placeholder="// 在此编辑代码..."
              spellcheck={false}
              wrap="off"
              onKeydown={handleKeydown}
              onScroll={onScroll}
            />
          </div>
        </div>
      </div>
    )
  }
})

export default ComponentSourceEditor;
