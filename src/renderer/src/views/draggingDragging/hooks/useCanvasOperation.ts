import { ref, onMounted, onBeforeUnmount } from "vue";
import { useDraggingDraggingStore } from "@renderer/stores/draggingDragging/useDraggingDraggingStore";
import { deepClone } from "@renderer/utils/index";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import { editCodeConfig } from "@renderer/api/apis/lowCode/lowCode";
import { createDefaultPageRoot, toSerializablePageSnapshot } from "@renderer/type/page-node";
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
      currentOperatingObjectIndex.value >= 0
    ) {
      // 获取历史中的倒数第二个对象，并设置为当前页面状态
      const previousPage =
        historyOperatingObject.value[currentOperatingObjectIndex.value - 1];
      if (previousPage) {
        pageJSON.value = deepClone(previousPage); // 使用 deepClone 来避免直接修改原始数据
        currentOperatingObjectIndex.value -= 1;
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
      currentOperatingObjectIndex.value < historyOperatingObject.value.length
    ) {
      // 获取上一步状态
      currentOperatingObjectIndex.value += 1;
      const previousPage =
        historyOperatingObject.value[currentOperatingObjectIndex.value];
      if (previousPage) {
        pageJSON.value = deepClone(previousPage); // 使用 deepClone 来避免直接修改原始数据
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
    currentOperatingObject.value = {};
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
    if (event.ctrlKey || event.metaKey || event.shiftKey) {
      // 适应Mac的Command键
      switch (event.key) {
        case "z":
          if (event.shiftKey) {
            event.preventDefault(); // 阻止浏览器默认行为
            upHistoryOperatingObject(); // 取消撤销
          } else {
            event.preventDefault(); // 阻止浏览器默认行为
            backHistoryOperatingObject(); // 撤销
          }
          break;
        case "y":
          event.preventDefault(); // 阻止浏览器默认行为
          clearHistoryOperatingObject(); // 清空页面
          break;
        case "s":
          event.preventDefault(); // 阻止浏览器默认行为
          // 实现保存逻辑
          saveHistoryOperatingObject();
          break;
        case "Backspace":
          // event.preventDefault(); // 阻止浏览器默认行为
          // 实现删除逻辑
          // deleteObject();
          break;
        case "a":
          // 实现全选逻辑
          break;
      }
    } else {
      switch (event.key) {
        case "Backspace":
          // event.preventDefault(); // 阻止浏览器默认行为
          // // 实现删除逻辑
          // deleteObject();
          break;
        case "a":
          // 实现全选逻辑
          break;
      }
    }
  };

  const initObject = ref(false);

  const init = () => {
    console.log("开始监听");
    if (!initObject.value) {
      document.addEventListener("keydown", handleKeyDown);
      initObject.value = true;
    } else {
      console.log("已经开启监听");
    }
  };

  onMounted(() => {
    // init()
  });

  onBeforeUnmount(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });

  return {
    addHistoryOperatingObject,
    backHistoryOperatingObject,
    upHistoryOperatingObject,
    clearHistoryOperatingObject,
    handleKeyDown,
    init,
  };
}
