import { http } from '../index';
// import { LoginData, LoginRes } from '../types/types';
import router from '../../router/index'

export const login = (params: any) => {
    return new Promise((resolve, reject) => {
        http.post('api/users/login', params).then(res => {
            if (res.code == 0) {
                sessionStorage.setItem('token', res.result.token);
                sessionStorage.setItem("user", JSON.stringify(res.result));
            }
            resolve(res);
            reject(res);
        });
    });
};

export const outLogin = (params?: any) => {
    return new Promise((resolve, reject) => {
        http.post('api/users/outLogin', params).then(res => {
            if (res.code == 0) {
                router.push({ name: 'login' })
            }
            resolve(res);
            reject(res);
        }).finally(() => {
            sessionStorage.removeItem('token')
            sessionStorage.removeItem('user')
        });
    });
};

export const wxCodeLogin = (params: any) => {
    return http.post("api/weixin/users/xcx/wxCodeLogin", params);
};


export const register = (params: any) => {
    return http.post('api/users/register', params);
};

export const getUerInfo = (params: any) => {
    return http.post('api/users/getUerInfo', params);
};

export const addFriends = (params: any) => {
    return http.post('api/users/addFriends', params);
};

export const deleteFriends = (params: any) => {
    return http.post('api/users/deleteFriends', params);
};

export const getFriends = (params: any) => {
    return http.post('api/users/getFriends', params);
};

export const addChatRecord = (params: any) => {
    return http.post('api/users/addChatRecord', params);
};

export const getChatRecord = (params: any) => {
    return http.post('api/users/getChatRecord', params);
};

export const deleteChatRecord = (params: any) => {
    return http.post('api/users/deleteChatRecord', params);
};

export const loginAuth = (params: any) => {
    return http.post('test/OAuth/loginAuth', params);
};
