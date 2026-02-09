import { computed, onMounted, onBeforeUnmount } from "vue";

export default function useCanvasOperation() {


  // 使用 Map 替代 WeakMap
  const processStringAddPxCache = new Map<string, string>();

  // 预编译正则表达式
  const unitRegex = /(px|rem|%|em|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc)$/i;
  const commaSpaceRegex = /[, ]+/;
  const camelCaseRegex = /([a-z])([A-Z])/g;

  const processStringAddPx = computed(() => {
    return (str: string) => {
      if (processStringAddPxCache.has(str)) {
        return processStringAddPxCache.get(str)!;
      }
      if (!str) {
        return '0';
      }

      // 如果字符串已经包含单位，则直接返回
      if (unitRegex.test(str)) {
        processStringAddPxCache.set(str, str);
        return str;
      }

      let result: string;
      if (commaSpaceRegex.test(str)) {
        const strArray = str.split(commaSpaceRegex).filter(Boolean);
        const processedArray = strArray.map(item => unitRegex.test(item) ? item : `${item}px`);
        result = processedArray.length ? processedArray.join(' ') : '23px';
      } else {
        // 对于纯数字，添加 px 单位；对于包含字母的值（如 auto, inherit 等）直接返回
        result = isNaN(Number(str)) ? str : `${str}px`;
      }

      processStringAddPxCache.set(str, result);
      return result;
    }
  });

  // 更新 addPx 函数以更好地处理动态单位
  const addPx = (v: string) => {
    if (!v || !String(v).trim()) return undefined;

    const str = String(v).trim();
    // 如果已经包含任何单位，直接返回
    if (unitRegex.test(str)) {
      return str;
    }
    // 对于纯数字，添加 px 单位
    if (!isNaN(Number(str))) {
      return `${str}px`;
    }
    // 对于其他情况（如 auto, inherit, initial 等），直接返回
    return str;
  };

  const addDeg = (v: string) => (v && String(v).trim() ? (/\d$/.test(String(v)) ? `${v}deg` : v) : undefined);

  // 渲染前收集配置信息，按分组输出 props + style（设计软件式分组）
  const collectProps = (item: any) => {
    if (!item || typeof item !== 'object') return {};
    const vnodeProps: any = {};
    const convertKey = (key: string) => {
      if (key.startsWith('cs')) {
        key = key.slice(2);
        key = key.replace(camelCaseRegex, '$1-$2').toLowerCase();
      }
      return key;
    };

    Object.keys(item).forEach((key) => {
      if (!key.includes('Props')) return;
      const resultProps: any = {};
      item[key]?.children?.forEach((child: any) => {
        if (!child.key) return;
        resultProps[convertKey(child.key)] = child.value;
      });

      const r = resultProps;
      let style: any = {};

      switch (key) {
        case 'positionProps':
          style = {
            left: addPx(r['left']),
            top: addPx(r['top']),
            width: addPx(r['width']),
            height: addPx(r['height']),
          };
          if (r['left'] || r['top']) style.position = 'absolute';
          const parts: string[] = [];
          if (r['rotate']) parts.push(`rotate(${addDeg(r['rotate']) || r['rotate']}`);
          const sx = r['scaleX'] === '-1' ? -1 : 1;
          const sy = r['scaleY'] === '-1' ? -1 : 1;
          if (sx !== 1 || sy !== 1) parts.push(`scale(${sx}, ${sy})`);
          if (parts.length) style.transform = parts.join(' ');
          break;
        case 'layoutProps':
          style = {
            display: r['display'],
            'flex-direction': r['flexDirection'],
            'flex-wrap': r['flexWrap'],
            'justify-content': r['justifyContent'],
            'align-items': r['alignItems'],
            'align-content': r['alignContent'],
            gap: addPx(r['gap']),
            'grid-template-columns': r['gridTemplateColumns'],
            'grid-template-rows': r['gridTemplateRows'],
            padding: addPx(r['padding']) || '0px',
            margin: addPx(r['margin']) || undefined,
            overflow: r['overflow'] || undefined,
          };
          break;
        case 'radiusProps':
          style = {
            'border-radius': addPx(r['border-radius']),
          };
          break;
        case 'layerProps':
          style = {
            opacity: r['opacity'] != null && r['opacity'] !== '' ? r['opacity'] : undefined,
            visibility: r['visibility'] || undefined,
          };
          break;
        case 'fillProps':
          style = {
            'background-color': r['background-color'] || undefined,
          };
          break;
        case 'strokeProps':
          // 支持按位置设置描边（四边/单边）
          const bw = addPx(r['border-width']);
          const bc = r['border-color'] || undefined;
          const bs = r['border-style'] || undefined;
          const pos = r['border-position'] || 'all';
          style = {};
          if (pos === 'all' || !pos) {
            style['border-width'] = bw;
            style['border-color'] = bc;
            style['border-style'] = bs;
          } else {
            const map: Record<string, string> = {
              top: 'border-top',
              right: 'border-right',
              bottom: 'border-bottom',
              left: 'border-left',
            };
            const prefix = map[pos];
            if (prefix) {
              style[`${prefix}-width`] = bw;
              style[`${prefix}-color`] = bc;
              style[`${prefix}-style`] = bs;
            }
          }
          break;
        case 'effectsProps':
          const shadows = [r['box-shadow-inner'], r['box-shadow']].filter(Boolean);
          if (shadows.length) style['box-shadow'] = shadows.join(', ');
          break;
        case 'divProps':
          // 兼容旧数据结构：若仍存在 divProps 则合并常见样式
          style = {
            width: addPx(r['width']),
            height: addPx(r['height']),
            'border-radius': addPx(r['border-radius']),
            'justify-content': r['justify-content'],
            'align-items': r['align-items'],
            'background-color': r['background-color'],
            display: r['display'],
            'flex-direction': r['flex-direction'],
            'flex-wrap': r['flex-wrap'],
            gap: addPx(r['gap']),
            padding: addPx(r['padding']) || '0px',
            margin: addPx(r['margin']) || undefined,
          };
          const dShadows = [r['box-shadow-inner'], r['box-shadow']].filter(Boolean);
          if (dShadows.length) style['box-shadow'] = dShadows.join(', ');
          break;
        case 'titleProps':
          style = {
            'text-align': r['text-align'] || undefined,
            'font-size': addPx(r['font-size']),
            'font-weight': r['font-weight'] || undefined,
            color: r['color'] || undefined,
            height: addPx(r['height']),
            margin: addPx(r['margin']) || undefined,
            padding: addPx(r['padding']) || undefined,
            'border-left-width': addPx(r['border-left-width']),
            'border-left-style': (r['border-left-width'] || r['border-left-color']) ? 'solid' : undefined,
            'border-left-color': r['border-left-color'] || undefined,
          };
          break;
        default:
          style = {};
      }

      vnodeProps[key] = { props: resultProps, style: Object.fromEntries(Object.entries(style).filter(([, v]) => v != null && v !== '')) };
    });

    return vnodeProps;
  };

  onMounted(() => {
    // init()
  });

  onBeforeUnmount(() => {
    // 清理资源
    processStringAddPxCache.clear();
  });


  return {
    processStringAddPx,
    collectProps
  }
}

