import Axios from 'axios';
import { Message } from 'iview';
import URL from '../config/url';
import CONF from '../config';
// eslint-disable-next-line import/no-cycle
import store from '../store';

const { STATUS_CODE } = CONF;
const NO_MESSAGE = [
    STATUS_CODE.NO_LOGIN,
    STATUS_CODE.NO_SELECT_SHOP,
    ...STATUS_CODE.WHITE_LIST,
];
const baseURL = URL.API;
const METHOD = {
    POST: 'post',
    GET: 'get',
};

// 请求拦截
const interceptors = (instance) => {
    instance.interceptors.request.use(
        config => config,
        error => Promise.reject(error),
    );

    // 添加响应拦截器
    instance.interceptors.response.use(
        (res) => {
            const { data } = res;
            if (!(data instanceof Blob)) {
                // hacked for login api, not having success code
                if (data.isSuccess === true) {
                    return data;
                }

                // {code: "-2002", msg: "系统异常-2002", data: "1004:暂无数据！"}
                if (data.code !== STATUS_CODE.SUCCESS) {
                    if (data.code === STATUS_CODE.NO_LOGIN) {
                        store.dispatch('reLogin');
                    }

                    if (data.msg && !NO_MESSAGE.includes(data.code)) {
                        Message.error(data.data || data.msg);
                    }
                    console.log(data, 'fanhui');
                    return Promise.reject(data);
                }
            }
            return data;
        },
        (error) => {
            // 对响应错误做点什么
            Message.error('服务器开小差啦');
            return Promise.reject(error);
        },
    );
};

// 创建实例
const create = (url) => {
    // if url start with http, then set baseURL to ''
    const _baseURL = url.indexOf(0, 4) === 'http' ? '' : baseURL;

    const conf = {
        baseURL: _baseURL,
        timeout: 1000000000,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        withCredentials: true,
    };
    return Axios.create(conf);
};

export class HttpRequest {
    constructor() {
        // 存储请求队列
        this.queue = {};
    }

    // 销毁请求实例
    destroy(url) {
        delete this.queue[url];
        const queue = Object.keys(this.queue);
        return queue.length;
    }

    // 请求实例
    request(options) {
        const instance = create();
        interceptors(instance, options.url);
        const newOptions = Object.assign({}, options);
        this.queue[newOptions.url] = instance;
        return instance(newOptions);
    }

    post(url, params) {
        const data = params && JSON.parse(JSON.stringify(params));
        const instance = create(url);
        if (data) {
            Object.keys(data).forEach(
                key => data[key] !== 0 && !data[key] && delete data[key],
            );
        }
        const options = { url, data, method: METHOD.POST };
        interceptors(instance, options.url);
        this.queue[options.url] = instance;
        return instance(options);
    }

    get(url, params) {
        const data = params && JSON.parse(JSON.stringify(params));
        const instance = create(url);
        if (data) {
            Object.keys(data).forEach(
                key => data[key] !== 0 && !data[key] && delete data[key],
            );
        }
        const options = { url, params: data, method: METHOD.GET };
        interceptors(instance, options.url);
        this.queue[options.url] = instance;
        return instance(options);
    }

    file(url, params) {
        // console.log(params, 'params333');
        const formData = new FormData();
        const instance = create(url);
        Object.keys(params).forEach((v) => {
            formData.append(v, params[v]);
        });
        const options = {
            url,
            data: formData,
            method: METHOD.POST,
            ContentType: 'multipart/form-data',
            // 原生获取上传进度的事件
            // onUploadProgress(progressEvent) {
            //     // eslint-disable-next-line no-bitwise
            //     const progress = ((progressEvent.loaded / progressEvent.total) * 100) | 0;
            //     // eslint-disable-next-line no-unused-expressions
            //     process && process({
            //         status: progress === 100 ? 'completed' : 'downloading',
            //         progress,
            //         receivedM: formateFileSize(progressEvent.loaded),
            //         totalM: formateFileSize(progressEvent.total),
            //         totalBytes: progressEvent.total,
            //         receivedBytes: progressEvent.loaded,
            //         name: params.name,
            //         path: params.path,
            //         type: 'upload',
            //         uploadTimestamp: params.uploadTimestamp,
            //     });
            // },
        };
        // interceptors(instance, options.url);
        this.queue[options.url] = instance;
        return instance(options);
    }
}

export const axios = new HttpRequest();
