import { computed, onMounted, onBeforeUnmount } from "vue";

export default function useCodeConfig() {
  const vnodeProps = {};
  const processStringAddPxCache = new Map();

  const processStringAddPx = computed(() => {
    return (str) => {
      if (processStringAddPxCache.has(str)) {
        return processStringAddPxCache.get(str);
      }
      if (!str) {
        return '0';
      }
      let result;
      if (/[, ]/.test(str)) {
        const strArray = str.split(/[, ]+/).filter(Boolean);
        const processedArray = strArray.map(item => /(px|rem|%|em)$/.test(item) ? item : `${item}px`);
        result = processedArray.length ? processedArray.join(' ') : '23px';
      } else {
        result = /(px|rem|%|em)$/.test(str) ? str : `${str}px`;
      }

      processStringAddPxCache.set(str, result);
      return result;
    }
  });

  // 渲染前收集配置信息
  const collectProps = (item) => {
    Object.keys(item).forEach((key) => {
      if (key.includes('Props')) {
        const resultProps = {};
        item[key]?.children.forEach((child) => {
          const newKey = child.key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
          resultProps[newKey] = child.value;
        });

        vnodeProps[key] = {
          props: resultProps,
          style: {
            'text-align': resultProps['text-align'],
            'font-size': processStringAddPx.value(resultProps['font-size']),
            'font-weight': resultProps['font-weight'],
            'margin': processStringAddPx.value(resultProps['margin']) || '10px 0px',
            'padding': processStringAddPx.value(resultProps['padding']) || '0px',
            'display': resultProps['display']
          }
        };
      }
    });
    return vnodeProps
  };


  onMounted(() => {
    // init()
  });

  onBeforeUnmount(() => {

  });

  return {
    processStringAddPx,
    collectProps
  };
}
