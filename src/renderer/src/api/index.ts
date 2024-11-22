import axios from 'axios';
import { ElMessage } from 'element-plus';
import { errTips } from './error/errTips';
import type { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { outLogin } from "@renderer/api/apis/user";
import router from '../router/index'

// const token = localStorage.getItem('token')
//     ? localStorage.getItem('token')
//     : sessionStorage.getItem('token');

let token;

const service: AxiosInstance = axios.create({
    baseURL: '/',
    timeout: 1000 * 60,
});

/* 请求拦截器 */
service.interceptors.request.use(
    (config) => {
        // cancelRequest=true 取消重复请求
        // if (config.data.cancelRequest) {
        //     cancelRequest = setInterval(() => {

        //     }, 3000)
        //     return Promise.reject('接口重复调用');
        // }

        token = sessionStorage.getItem('token');

        if (token && config && config?.headers) {
            config.headers.Authorization = token;
        }

        // // 参数统一处理，请求都使用data传参
        // if (config.method.toLocaleLowerCase() === 'post' || config.method.toLocaleLowerCase() === 'put') {
        //     config.data = config.data.data;
        // } else if (config.method.toLocaleLowerCase() === 'get' || config.method.toLocaleLowerCase() === 'delete') {
        //     config.params = config.data;
        // }
        return config;
    },
    (error: AxiosError) => {
        const { code, message } = error;
        if (code) ElMessage.error(errTips[code] || message || '未知错误');
        return Promise.reject(error);
    }
);

/* 响应拦截器 */
service.interceptors.response.use(
    (response: AxiosResponse) => {
        const { code, message, error } = response.data;
        // 根据自定义错误码判断请求是否成功
        if (code === 0) {
            // 将组件用的数据返回
            return response.data;
        } else {
            // token已经过期退到登录页面
            if (error == 10101) {
                router.push({ name: 'login' })
            }
            // 处理业务错误。
            ElMessage.error(errTips[code] || message || '未知错误');
            return Promise.reject(response.data);
        }
    },
    (error: AxiosError) => {
        // 处理 HTTP 网络错误
        let message = '';
        // HTTP 状态码
        const status = error.response?.status;
        switch (status) {
            case 401:
                message = 'token 失效，请重新登录';
                // 这里可以触发退出的 action
                outLogin()
                break;
            case 403:
                message = '拒绝访问';
                break;
            case 404:
                message = '请求地址错误';
                break;
            case 500:
                message = '服务器故障';
                break;
            default:
                message = '网络连接故障';
        }

        ElMessage.error(message);
        return Promise.reject(error);
    }
);

/* 导出封装的请求方法 */
export const http = {
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return service.get(url, config);
    },

    post<T = any>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
        return service.post(url, data, config);
    },

    put<T = any>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
        return service.put(url, data, config);
    },

    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return service.delete(url, config);
    },
};

// 刷新Token
// const refreshToken = () => { };
