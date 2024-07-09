// 获取当前分页数据
export const dataGrouping = (val: Array<object> | any, pageSize: number, page: number) => {
  if (val.length < pageSize) return val;
  return val.slice(pageSize * (page - 1), pageSize * (page - 1) + pageSize);
};
