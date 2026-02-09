import { ref, onBeforeUnmount } from "vue";
import { useDraggingDraggingStore } from "@renderer/stores/draggingDragging/useDraggingDraggingStore";
import { deepClone } from "@renderer/utils/index";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import { editCodeConfig } from "@renderer/api/apis/lowCode/lowCode";
import { createDefaultPageRoot, toSerializablePageSnapshot } from "@renderer/type/page-node";

// 快捷键监听：用模块级引用计数保证只绑定一次，避免多个组件重复绑定/卸载互相影响
let keydownRefCount = 0;
let attachedKeydownHandler: ((e: KeyboardEvent) => void) | null = null;
export default function useCanvasOperation() {
  const store = useDraggingDraggingStore();
  const {
    pageJSON,
    currentDragObject,
    currentOperatingObject,
    currentOperatingObjectIndex,
    historyOperatingObject,
    currentCodeConfigId,
    currentCodeConfigName,
  } = storeToRefs(store);

  const MAX_HISTORY_LENGTH = 20;

  /** 按 key 在页面树中查找节点（不含 page 根的 props 之外字段） */
  const findNodeByKey = (root: any, key?: string): any => {
    if (!root || !key) return null;
    const stack: any[] = Array.isArray(root?.children) ? [...root.children] : [];
    while (stack.length) {
      const n = stack.shift();
      if (!n) continue;
      if (n.key === key) return n;
      if (Array.isArray(n.children) && n.children.length) {
        stack.unshift(...n.children);
      }
    }
    return null;
  };

  /** pageJSON 被替换后，刷新当前选中对象引用，避免控制器/渲染器不同步 */
  const refreshCurrentOperatingObjectRef = () => {
    const cur = currentOperatingObject.value;
    if (!cur) return;
    // 选中的是页面根
    if (cur.type === 'page') {
      currentOperatingObject.value = pageJSON.value;
      return;
    }
    const key = cur.key;
    if (!key) {
      currentOperatingObject.value = null;
      return;
    }
    const next = findNodeByKey(pageJSON.value, key);
    currentOperatingObject.value = next || null;
  };

  /** 删除当前选中节点（写入历史栈，支持撤回） */
  const deleteSelectedNode = () => {
    const cur = currentOperatingObject.value;
    if (!cur) return false;
    if (cur.type === 'page') return false;
    const key = cur.key;
    if (!key) return false;

    // 支持删除顶层 children（container 等），以及任意深度节点
    const removeByKey = (list: any[], targetKey: string): boolean => {
      if (!Array.isArray(list)) return false;
      for (let i = 0; i < list.length; i++) {
        const n = list[i];
        if (!n) continue;
        if (n.key === targetKey) {
          list.splice(i, 1);
          return true;
        }
        if (Array.isArray(n.children) && n.children.length) {
          if (removeByKey(n.children, targetKey)) return true;
        }
      }
      return false;
    };

    const removed = removeByKey(pageJSON.value.children as any[], key);
    if (removed) {
      currentOperatingObject.value = null;
      addHistoryOperatingObject();
      return true;
    }
    return false;
  };

  /**
   * 添加当前操作对象的历史记录（撤销/重做用）
   * - 若在历史中间产生新操作，则截断后续记录
   * - 若与上一条相同则跳过，避免重复
   * - 最多保留 MAX_HISTORY_LENGTH 条
   */
  const addHistoryOperatingObject = () => {
    // 使用 toSerializablePageSnapshot 排除 VueDraggable/Sortable 注入的循环引用
    const snapshot = toSerializablePageSnapshot(pageJSON.value);
    if (!snapshot) return;

    const history = historyOperatingObject.value;
    const currentIndex = currentOperatingObjectIndex.value;

    // 若在历史中间产生新操作，截断后续记录
    if (history.length > 0 && currentIndex < history.length - 1) {
      historyOperatingObject.value = history.slice(0, currentIndex + 1);
    }

    // 若与上一条相同则跳过（快照已为纯 JSON 结构，可安全 stringify）
    const lastSnapshot = historyOperatingObject.value[historyOperatingObject.value.length - 1];
    if (lastSnapshot && JSON.stringify(snapshot) === JSON.stringify(lastSnapshot)) {
      return;
    }

    historyOperatingObject.value.push(snapshot);

    // 超过最大条数时移除最旧的一条
    if (historyOperatingObject.value.length > MAX_HISTORY_LENGTH) {
      historyOperatingObject.value = historyOperatingObject.value.slice(1);
    }

    currentOperatingObjectIndex.value = historyOperatingObject.value.length - 1;
  };

  /**
   * 回到上一操作
   *
   * @returns 无返回值
   */
  const backHistoryOperatingObject = () => {
    if (
      historyOperatingObject.value.length > 1 &&
      currentOperatingObjectIndex.value > 0
    ) {
      // 获取历史中的倒数第二个对象，并设置为当前页面状态
      const previousPage =
        historyOperatingObject.value[currentOperatingObjectIndex.value - 1];
      if (previousPage) {
        pageJSON.value = deepClone(previousPage); // 使用 deepClone 来避免直接修改原始数据
        currentOperatingObjectIndex.value -= 1;
        refreshCurrentOperatingObjectRef();
      }
    }
  };
  /**
   * 撤销回到下一操作
   *
   * @returns 无返回值
   */
  const upHistoryOperatingObject = () => {
    if (
      historyOperatingObject.value.length > 1 &&
      currentOperatingObjectIndex.value < historyOperatingObject.value.length - 1
    ) {
      // 获取上一步状态
      currentOperatingObjectIndex.value += 1;
      const previousPage =
        historyOperatingObject.value[currentOperatingObjectIndex.value];
      if (previousPage) {
        pageJSON.value = deepClone(previousPage); // 使用 deepClone 来避免直接修改原始数据
        refreshCurrentOperatingObjectRef();
      }
    }
  };

  /**
   * 清空页面，但是不清空操作步骤
   *
   * @returns 无返回值
   */
  const clearHistoryOperatingObject = () => {
    pageJSON.value = createDefaultPageRoot();
    currentDragObject.value = {};
    currentOperatingObject.value = null;
    addHistoryOperatingObject();
  };

  /**
   * 保存历史操作对象
   */
  const saveHistoryOperatingObject = () => {
    try {
      addHistoryOperatingObject(); // 记录历史记录
      // 保存成功后，延迟一秒提示
      console.log("保存成功",pageJSON.value);
      editCodeConfig({
        codeConfig: pageJSON.value,
        codeConfigName: currentCodeConfigName.value,
        codeConfigId: currentCodeConfigId.value,
      }).then(res => {
        ElMessage({ message: "保存成功", type: "success" });
        console.log(res);
      })
    } catch (err) {
      console.error("保存失败----" + err);
    }
  };

  /**
   * 深度优先搜索并删除目标节点
   *
   * @param node 当前节点
   * @param targetKey 目标节点的key值
   * @returns 如果找到并删除目标节点则返回true，否则返回false
   */
  const depthFirstSearchAndDelete = (node, targetKey) => {
    if (!node) return false;

    if (node instanceof Array) {
      node.map(e => depthFirstSearchAndDelete(e, targetKey))
    }

    if (node.key === targetKey) {
      return true;
    }

    if (node.children && node.children instanceof Array && node.children.length > 0) {
      for (let i = 0; i < node.children.length; i++) {
        if (depthFirstSearchAndDelete(node.children[i], targetKey)) {
          node.children.splice(i, 1);
          currentOperatingObject.value = null
          break;
        }
      }
    }
    return false
  };

  /**
   * 删除对象
   *
   * @returns 无返回值
   */
  // const deleteObject = () => {
  //   if (!currentOperatingObject.value) {
  //     console.error("当前操作对象为空，无法删除");
  //     return;
  //   }

  //   for (let i = 0; i < pageJSON.value.children.length; i++) {
  //     if (pageJSON.value.children[i]?.key == currentOperatingObject.value.key) {
  //       pageJSON.value.children.splice(i, 1);
  //       currentOperatingObject.value = null
  //       break;
  //     }
  //     depthFirstSearchAndDelete(pageJSON.value.children[i], currentOperatingObject.value.key) // 深层查找
  //   }
  // };

  // 快捷键绑定
  // ctrl+z 撤销
  // ctrl+shift+z 取消撤销
  // ctrl+y 重做
  // ctrl+s 保存
  // ctrl+a 全选

  const handleKeyDown = (event) => {
    const t = event.target as HTMLElement | null;
    const tag = (t?.tagName || '').toLowerCase();
    const isEditingText =
      tag === 'input' ||
      tag === 'textarea' ||
      (t as HTMLElement | null)?.isContentEditable;

    const key = (event.key || '').toLowerCase();
    const isCmdOrCtrl = event.metaKey || event.ctrlKey;

    if (isCmdOrCtrl) {
      // Mac Command / Windows Ctrl 快捷键
      switch (key) {
        case 'z':
          // 文本编辑区域内优先交给编辑器自身的撤销/重做
          if (isEditingText) return;
          event.preventDefault();
          if (event.shiftKey) {
            // Cmd+Shift+Z / Ctrl+Shift+Z => 重做
            upHistoryOperatingObject();
          } else {
            // Cmd+Z / Ctrl+Z => 撤销
            backHistoryOperatingObject();
          }
          break;
        case 'y':
          // Ctrl+Y 也作为重做（兼容 Windows 习惯）
          if (isEditingText) return;
          event.preventDefault();
          upHistoryOperatingObject();
          break;
        case 's':
          event.preventDefault();
          saveHistoryOperatingObject();
          break;
        default:
          break;
      }
    } else {
      switch (key) {
        case 'delete':
          // Delete 更偏向“删除选中组件”；若在输入框内编辑文字，可用 Backspace 删除字符
          event.preventDefault();
          deleteSelectedNode();
          break;
        case 'backspace':
          if (isEditingText) return;
          event.preventDefault();
          deleteSelectedNode();
          break;
        case 'a':
          // 实现全选逻辑
          break;
      }
    }
  };

  const initObject = ref(false);

  const init = () => {
    // 仅首次绑定监听，后续调用只做引用计数
    if (!attachedKeydownHandler) {
      attachedKeydownHandler = (e: KeyboardEvent) => handleKeyDown(e);
      document.addEventListener("keydown", attachedKeydownHandler);
    }
    keydownRefCount += 1;
    initObject.value = true;
  };

  /** 释放快捷键监听（与 init 配套，引用计数归零才真正解绑） */
  const dispose = () => {
    if (!initObject.value) return;
    initObject.value = false;
    keydownRefCount = Math.max(0, keydownRefCount - 1);
    if (keydownRefCount === 0 && attachedKeydownHandler) {
      document.removeEventListener("keydown", attachedKeydownHandler);
      attachedKeydownHandler = null;
    }
  };

  onBeforeUnmount(() => {
    // 避免多个 useCanvasOperation 实例互相影响，用引用计数统一解绑
    dispose();
  });

  return {
    addHistoryOperatingObject,
    backHistoryOperatingObject,
    upHistoryOperatingObject,
    clearHistoryOperatingObject,
    deleteSelectedNode,
    handleKeyDown,
    init,
    dispose,
  };
}
