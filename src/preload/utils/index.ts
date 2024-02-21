export const memoryUsage = () => {
  const a = {
    rss: 'rss',
    heapTotal: '堆合计',
    heapUsed: '堆已使用大小',
    external: '外部内存',
    arrayBuffers: '数组缓冲区'
  }
  const obj: Array<Object> = []
  const e = process.memoryUsage()
  Object.keys(e).forEach((item) => {
    obj.push({ name: a[item], size: e[item] / 1024 / 1024 })
  })
  return obj
}

export const guid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function deepClone(e) {
  let map = new Map()
  function _deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj
    if (map.has(obj)) {
      return map.get(obj)
    }
    let result = Array.isArray(obj) ? [] : {}
    map.set(obj, result)
    for (let key in obj) {
      if (typeof obj[key] === 'object') {
        result[key] = _deepClone(obj[key])
      } else {
        result[key] = obj[key]
      }
    }
    return result
  }
  return _deepClone(e)
}




