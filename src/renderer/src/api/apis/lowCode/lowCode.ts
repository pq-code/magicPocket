
import { http } from '@renderer/api';

// 新增配置文件
export const saveCodeConfig = (params: any) => {
    return http.post("api/lowCode/saveCodeConfig", params);
};

// 编辑
export const editCodeConfig = (params: any) => {
  return http.post("api/lowCode/editCodeConfig", params);
};

// 编辑
export const getCodeConfig = (params: any) => {
  return http.post("api/lowCode/getCodeConfig", params);
};
