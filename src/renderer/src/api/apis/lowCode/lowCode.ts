import { http } from '@renderer/api'

export interface CodeConfigItem {
  id?: number
  codeConfigId: string
  codeConfigName: string
  userId?: string
  userName?: string
  createdAt?: string
  updatedAt?: string
}

/** 列出已编排的低代码页面 */
export async function listCodeConfigs(params?: { page?: number; pageSize?: number }) {
  const res = (await http.post<{ code?: number; result?: { list?: CodeConfigItem[]; total?: number } }>(
    '/api/lowCode/listCodeConfigs',
    params || {}
  )) as any
  const result = res?.result ?? res
  return {
    list: Array.isArray(result?.list) ? result.list : [],
    total: result?.total ?? 0
  }
}

// 新增配置文件
export const saveCodeConfig = (params: any) => {
    return http.post("/api/lowCode/saveCodeConfig", params);
};

// 编辑
export const editCodeConfig = (params: any) => {
  return http.post("/api/lowCode/editCodeConfig", params);
};

/** 删除配置 */
export async function deleteCodeConfig(codeConfigId: string): Promise<boolean> {
  try {
    await http.post('/api/lowCode/deleteCodeConfig', { codeConfigId })
    return true
  } catch {
    return false
  }
}

// 编辑
export const getCodeConfig = (params: any) => {
  return http.post("/api/lowCode/getCodeConfig", params);
};
