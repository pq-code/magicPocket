/**
 * 组件列表：IDE 风格的文件树展示，支持右键菜单
 */
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import { ElTree, ElMessage, ElMessageBox } from 'element-plus';

/**
 * 文件类型图标映射（iconfont），使用各语言/格式的品牌色
 */
const getFileIcon = (name) => {
  const ext = name ? name.toLowerCase() : '';
  if (ext.endsWith('.vue')) return { icon: 'icon-Vue', color: '#42b883' };
  if (ext.endsWith('.js')) return { icon: 'icon-js', color: '#f7df1e' };
  if (ext.endsWith('.jsx') || ext.endsWith('.tsx')) return { icon: 'icon-jsx', color: '#61dafb' };
  if (ext.endsWith('.ts')) return { icon: 'icon-ts', color: '#3178c6' };
  if (ext.endsWith('.md')) return { icon: 'icon-md', color: '#083fa1' };
  if (ext.endsWith('.json')) return { icon: 'icon-JSON_1', color: '#cbcb41' };
  if (ext.endsWith('.less') || ext.endsWith('.css') || ext.endsWith('.scss') || ext.endsWith('.sass')) return { icon: 'icon-CSS', color: '#264de4' };
  return { icon: 'icon-file', color: '#999' };
};

/**
 * 文件夹图标
 */
const getFolderIcon = (expanded) => ({
  icon: expanded ? 'icon-wenjianjiadakai' : 'icon-wenjianjia',
  color: '#e8a838'
});

const ComponentList = defineComponent({
  name: 'ComponentList',
  props: {
    groupedComponents: {
      type: Object,
      default: () => ({})
    },
    selected: {
      type: Object,
      default: null
    },
    libraryPath: {
      type: String,
      default: ''
    }
  },
  emits: ['select', 'selectFile', 'refresh'],
  setup(props, { emit }) {
    const treeRef = ref(null);
    const expandedKeys = ref([]);
    const contextMenu = ref({
      visible: false,
      x: 0,
      y: 0,
      data: null
    });

    // 将组件列表转换为树形结构（使用扫描得到的完整 fileTree）
    const attachComponent = (nodes, comp) => {
      if (!nodes || !Array.isArray(nodes)) return nodes
      return nodes.map((node) => {
        const n = { ...node, component: comp }
        if (n.children?.length) {
          n.children = attachComponent(n.children, comp)
        }
        return n
      })
    }

    const treeData = computed(() => {
      const components = Object.values(props.groupedComponents).flat()
      return components.map((comp) => {
        let children
        if (comp.fileTree && comp.fileTree.length > 0) {
          children = attachComponent(comp.fileTree, comp)
        } else {
          const compDir = comp.componentDir || ''
          const localPath = comp.npm?.localPath || ''
          const entryFileName = localPath.split('/').pop() || 'index.vue'
          const hasDescriptor = !!comp.descriptorPath
          const srcPath = compDir ? `${compDir}/src` : ''
          children = [
            {
              id: `${comp.type}__src`,
              label: 'src',
              isFolder: true,
              filePath: srcPath,
              children: [{
                id: `${comp.type}__entry`,
                label: entryFileName,
                isFile: true,
                filePath: localPath,
                component: comp
              }]
            }
          ]
          if (hasDescriptor) {
            children.push({
              id: `${comp.type}__meta.ts`,
              label: 'meta.ts',
              isFile: true,
              isDescriptor: true,
              filePath: comp.descriptorPath,
              component: comp
            })
          }
        }

        return {
          id: comp.type,
          label: comp.type,
          isComponent: true,
          component: comp,
          children
        }
      })
    })

    const getNodePath = (data) => {
      if (data.isComponent && data.component?.componentDir) return data.component.componentDir;
      return data.filePath || '';
    };

    const getParentPath = (data) => {
      if (data.isComponent && data.component?.componentDir) return data.component.componentDir;
      if (data.isFolder && data.filePath) return data.filePath;
      if (data.isFile && data.filePath) return data.filePath.split('/').slice(0, -1).join('/');
      return '';
    };

    const handleContextMenu = (e, data) => {
      e.preventDefault();
      e.stopPropagation();
      const path = getNodePath(data);
      const parentPath = getParentPath(data);
      if (!path && !parentPath && !data.isComponent) return;
      contextMenu.value = {
        visible: true,
        x: e.clientX,
        y: e.clientY,
        data: { ...data, nodePath: path, parentPath: parentPath || path }
      };
    };

    const closeContextMenu = () => {
      contextMenu.value.visible = false;
    };

    const copyPath = async () => {
      const path = contextMenu.value.data?.nodePath || contextMenu.value.data?.parentPath;
      if (!path) return;
      try {
        await navigator.clipboard.writeText(path);
        ElMessage.success('已复制路径');
      } catch {
        ElMessage.error('复制失败');
      }
      closeContextMenu();
    };

    const doRename = async () => {
      const d = contextMenu.value.data;
      const oldPath = d?.nodePath || (d?.isFile && d?.filePath);
      if (!oldPath || !window.electronAPI?.renameFileOrFolder) return;
      const currentName = d?.label || '';
      try {
        const { value } = await ElMessageBox.prompt('请输入新名称', '重命名', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: currentName
        });
        if (value && value !== currentName) {
          await window.electronAPI.renameFileOrFolder(oldPath, value);
          ElMessage.success('重命名成功');
          emit('refresh');
        }
      } catch { /* cancel */ }
      closeContextMenu();
    };

    const doDelete = async () => {
      const path = contextMenu.value.data?.nodePath || contextMenu.value.data?.filePath;
      if (!path || !window.electronAPI?.deleteFileOrFolder) return;
      try {
        await ElMessageBox.confirm('确定要删除吗？此操作不可恢复。', '删除', {
          type: 'warning',
          confirmButtonText: '删除',
          cancelButtonText: '取消'
        });
        await window.electronAPI.deleteFileOrFolder(path);
        ElMessage.success('已删除');
        emit('refresh');
      } catch { /* cancel */ }
      closeContextMenu();
    };

    const doCreateFile = async () => {
      const parentPath = contextMenu.value.data?.parentPath || contextMenu.value.data?.nodePath;
      if (!parentPath || !window.electronAPI?.createFileOrFolder) return;
      try {
        const { value } = await ElMessageBox.prompt('请输入文件名（含扩展名）', '新建文件', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPlaceholder: '如 index.vue、meta.ts'
        });
        if (value && !/[/\\]/.test(value)) {
          await window.electronAPI.createFileOrFolder(parentPath, value, false);
          ElMessage.success('创建成功');
          emit('refresh');
        } else if (value) {
          ElMessage.warning('文件名不能包含路径分隔符');
        }
      } catch { /* cancel */ }
      closeContextMenu();
    };

    const doCreateFolder = async () => {
      const parentPath = contextMenu.value.data?.parentPath || contextMenu.value.data?.nodePath;
      if (!parentPath || !window.electronAPI?.createFileOrFolder) return;
      try {
        const { value } = await ElMessageBox.prompt('请输入文件夹名', '新建文件夹', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        });
        if (value && /^[a-zA-Z0-9_.-]+$/.test(value)) {
          await window.electronAPI.createFileOrFolder(parentPath, value, true);
          ElMessage.success('创建成功');
          emit('refresh');
        } else if (value) {
          ElMessage.warning('文件夹名仅支持字母、数字、下划线、横线、点');
        }
      } catch { /* cancel */ }
      closeContextMenu();
    };

    onMounted(() => {
      document.addEventListener('click', closeContextMenu);
    });
    onUnmounted(() => {
      document.removeEventListener('click', closeContextMenu);
    });

    const handleNodeClick = (data) => {
      if (data.isComponent) {
        emit('select', data.component)
      } else if (data.isFile && data.filePath) {
        emit('select', data.component)
        emit('selectFile', {
          component: data.component,
          filePath: data.filePath,
          isDescriptor: data.isDescriptor
        })
      }
    }

    // 渲染树节点
    const renderContent = (h, { node, data }) => {
      let iconInfo
      const isFolder = data.isComponent || data.isFolder || (data.children && data.children.length > 0)
      if (isFolder) {
        iconInfo = getFolderIcon(node.expanded)
      } else {
        iconInfo = getFileIcon(data.label)
      }

      const isSelected = data.isComponent && props.selected?.type === data.component?.type;
      const hasPath = getNodePath(data) || getParentPath(data) || data.isComponent;

      return (
        <div
          class={['tree-node', isSelected ? 'selected' : '']}
          onContextmenu={hasPath ? (e) => handleContextMenu(e, data) : undefined}
        >
          <i 
            class={['iconfont', iconInfo?.icon || 'icon-file']} 
            style={{ color: iconInfo?.color, marginRight: '6px', fontSize: '14px' }}
          />
          <span class="node-label">{data.label}</span>
          {data.isComponent && data.component?.componentName && (
            <span class="node-name">{data.component.componentName}</span>
          )}
        </div>
      );
    };

    return () => (
      <div class="component-list-tree">
        {/* 目录标题 */}
        <div class="tree-header">
          <i class="iconfont icon-wenjianjia" style="color: #e8a838; marginRight: 6px;" />
          <span class="tree-title">组件库</span>
          {props.libraryPath && (
            <span class="tree-path" title={props.libraryPath}>
              {props.libraryPath.split('/').pop()}
            </span>
          )}
        </div>

        {contextMenu.value.visible && (
          <div
            class="context-menu"
            style={{
              left: contextMenu.value.x + 'px',
              top: contextMenu.value.y + 'px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div class="context-menu-item" onClick={copyPath}>
              <i class="iconfont icon-fuzhi" style="margin-right: 6px;" />
              复制路径
            </div>
            {contextMenu.value.data?.nodePath || contextMenu.value.data?.filePath ? (
              <>
                <div class="context-menu-item" onClick={doRename}>
                  <i class="iconfont icon-bianji" style="margin-right: 6px;" />
                  重命名
                </div>
                <div class="context-menu-item danger" onClick={doDelete}>
                  <i class="iconfont icon-shanchu" style="margin-right: 6px;" />
                  删除
                </div>
              </>
            ) : null}
            <div class="context-menu-divider" />
            <div class="context-menu-item" onClick={doCreateFile}>
              <i class="iconfont icon-file" style="margin-right: 6px;" />
              新建文件
            </div>
            <div class="context-menu-item" onClick={doCreateFolder}>
              <i class="iconfont icon-wenjianjia" style="margin-right: 6px;" />
              新建文件夹
            </div>
          </div>
        )}

        {treeData.value.length > 0 ? (
          <ElTree
            ref={treeRef}
            data={treeData.value}
            node-key="id"
            default-expand-all={false}
            expand-on-click-node={true}
            highlight-current
            render-content={renderContent}
            onNodeClick={handleNodeClick}
            class="file-tree"
          />
        ) : (
          <div class="empty-tree">
            <i class="iconfont icon-wenjianjia" style="fontSize: 32px; color: #ccc;" />
            <p>暂无组件</p>
            <p class="hint">选择目录后自动扫描组件</p>
          </div>
        )}
      </div>
    );
  }
});

export default ComponentList;
