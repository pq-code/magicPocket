
import {  ref, onMounted, onBeforeUnmount } from 'vue';
import { useDraggingDraggingStore } from "@renderer/stores/draggingDragging/useDraggingDraggingStore"
import { deepClone } from '@renderer/utils/index'
import { ElMessage } from "element-plus";
import { storeToRefs } from 'pinia'

export default function canvasOperation() {

let {
  pageJSON, // 页面所有数据
  currentDragObject, // 当前拖拽对象
  currentOperatingObject, // 当前操作对象
  currentOperatingObjectIndex, // 当前处于第几步
  historyOperatingObject  // 历史操作列表 最多纪录20步
} = storeToRefs(useDraggingDraggingStore())

/**
 * 添加当前操作对象的历史记录
 *
 * @returns 无返回值
 */
  const addHistoryOperatingObject = () => {
  if (historyOperatingObject.value.length >= 20) {
    // 使用 slice 替代 shift + push，减少数组操作
    historyOperatingObject.value = historyOperatingObject.value.slice(1);
    currentOperatingObjectIndex.value -= 1
  }
  // 假设 deepClone 函数存在且能正确返回 pageJSON.value 的深拷贝
  const clonedPage = deepClone(pageJSON.value) as typeof pageJSON;
  if (clonedPage !== undefined) {
    // 判断当前值和上一次是否相同，相同就不保存了
    if (JSON.stringify(clonedPage) === JSON.stringify(historyOperatingObject.value[historyOperatingObject.value.length - 1])) {
      return
    }
    currentOperatingObjectIndex.value += 1
    historyOperatingObject.value.push(clonedPage);
  }
};

/**
 * 回到上一操作
 *
 * @returns 无返回值
 */
const backHistoryOperatingObject = () => {
  if (historyOperatingObject.value.length > 1) {
    // 获取历史中的倒数第二个对象，并设置为当前页面状态
    const previousPage = historyOperatingObject.value[historyOperatingObject.value.length - 2];
    if (previousPage) {
      pageJSON = deepClone(previousPage); // 使用 deepClone 来避免直接修改原始数据
    }
    // 移除当前历史记录中的最后一个元素（因为我们已经回退了）
    historyOperatingObject.value.pop();
    currentOperatingObjectIndex.value -= 1;
  }
};
/**
 * 撤销回到下一操作
 *
 * @returns 无返回值
 */
  const upHistoryOperatingObject = () => {
    if (historyOperatingObject.value.length > 1 && currentOperatingObjectIndex.value < historyOperatingObject.value.length - 1) {
      // 获取上一步状态
      currentOperatingObjectIndex.value += 1;
      const previousPage = historyOperatingObject.value[currentOperatingObjectIndex.value];
      if (previousPage) {
        pageJSON.value = deepClone(previousPage); // 使用 deepClone 来避免直接修改原始数据
      }
    }
  }

  /**
 * 清空页面，但是不清空操作步骤
 *
 * @returns 无返回值
 */
const clearHistoryOperatingObject = () => {
  pageJSON.value = {} // 清空
  currentDragObject.value = {}
  currentOperatingObject.value= {}
  addHistoryOperatingObject()
}

  /**
   * 保存历史操作对象
   */
  const saveHistoryOperatingObject = () => {
    try {
      addHistoryOperatingObject();
      setTimeout(() => {
        ElMessage({ message: '保存成功', type: 'success' })
        console.log(historyOperatingObject.value)
      }, 100)
    } catch (err) {
      console.error('保存失败----'+ err)
    }
  }

  // 快捷键绑定
  // ctrl+z 撤销
  // ctrl+shift+z 取消撤销
  // ctrl+y 重做
  // ctrl+s 保存
  // ctrl+a 全选

  const handleKeyDown = (event) => {
    if (event.ctrlKey || event.metaKey) { // 适应Mac的Command键
      switch (event.key) {
        case 'z':
          if (event.shiftKey) {
            event.preventDefault(); // 阻止浏览器默认行为
            upHistoryOperatingObject() // 取消撤销
          } else {
            event.preventDefault(); // 阻止浏览器默认行为
            backHistoryOperatingObject(); // 撤销
          }
          break;
        case 'y':
          event.preventDefault(); // 阻止浏览器默认行为
          clearHistoryOperatingObject(); // 清空页面
          break;
        case 's':
          event.preventDefault(); // 阻止浏览器默认行为
          // 实现保存逻辑
          saveHistoryOperatingObject()
          break;
        case 'a':
          // 实现全选逻辑
          break;
      }
    }
  };

  const initObject = ref(null)

  const init = () => {
    if (initObject.value === null) {
      initObject.value = document.addEventListener('keydown', handleKeyDown);
    } else {
      console.log('已经开启监听')
    }
  }

  onMounted(() => {
    init()
  });

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  return {
    addHistoryOperatingObject,
    backHistoryOperatingObject,
    upHistoryOperatingObject,
    clearHistoryOperatingObject,
    handleKeyDown,
    init
  }
}


