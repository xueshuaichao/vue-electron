/* eslint-disable import/no-cycle */
/**
 * @file
 * @author tanghao
 * @date 2018/8/11
 */

import { axios } from '../libs/axios';
import config from '../config/url';

const HOST = config.API;

const baseUrl = '/ptyhzx-basic-education/ptyhzx/v1/';
export default {
    getUserInfo(data) {
        return axios.post(
            `${config.PASSPORT}/ptyhzx-basic-education/ptyhzx/v1/getUserInfo`,
            data,
        );
    },

    login(data) {
        return axios.post(
            `${config.PASSPORT}/ptyhzx-basic-education/ptyhzx/v1/login`,
            data,
        );
    },
    setCookie(data) {
        return axios.get(
            'https://qdzyzx-test.12study.cn/ptyhzx-basic-education/ptyhzx/v1/setCookie',
            data,
        );
    },
    sendPhoneValidCode(data) {
        return axios.get(`${baseUrl}bind/sendPhoneValidCodeBind`, data);
    },

    bindPhone(data) {
        return axios.get(`${baseUrl}bind/bindPhone`, data);
    },
    // wechat bind
    bindAndLogin(data) {
        return axios.post(
            `${config.PASSPORT}${baseUrl}wechat/bindAndLogin`,
            data,
        );
    },

    // wechat callback
    loginCallBack(data) {
        return axios.post(
            `${config.PASSPORT}${baseUrl}wechat/loginCallBack`,
            data,
        );
    },
    selectUserType(data) {
        return axios.get(
            `${config.PASSPORT}/ptyhzx-basic-education/ptyhzx/v1/clickUserType`,
            data,
        );
    },
    loginOut(data) {
        return axios.post(`${config.PASSPORT}${baseUrl}/logoutNoSkip`, data);
    },
    loginSync(data) {
        return axios.get(`${HOST}/api/basic/loginSync`, data);
    },
    searchResList(data) {
        return axios.get(`${HOST}/api/resource/getResList`, data);
    },
    getResList(data) {
        return axios.get(
            `${HOST}/api/resource/getResListFilterFileFolderId`,
            data,
        );
    },
    delRes(data) {
        return axios.get(`${HOST}/api/resource/delRes`, data);
    },
    fileUpload(data, process) {
        return axios.file(`${config.UPLOAD}/fileUpload`, data, process);
    },
    fileUpload2(data, process) {
        return axios.file(
            'http://zy-upload.wdcloud.cc/fileUpload2/fileUploadcty2',
            data,
            process,
        );
    },
    getModuleList(data) {
        return axios.get(`${HOST}/api/resource/getModuleList`, data);
    },
    addPreRes(data) {
        return axios.post(`${HOST}/api/resource/addPreRes`, data);
    },
    // 重命名
    updateRes(data) {
        return axios.get(`${HOST}/api/resource/updateRes`, data);
    },
    // 添加收藏
    collect(data) {
        return axios.get(`${HOST}/api/resource/collect`, data);
    },
    // 新建文件夹
    addResFileFolder(data) {
        return axios.post(`${HOST}/api/resource/addResFileFolder`, data);
    },
    // 文件夹重命名
    updateResFileFolderNameById(data) {
        return axios.get(
            `${HOST}/api/resource/updateResFileFolderNameById`,
            data,
        );
    },
    // 查询文件夹
    getResFileFolderByPId(data) {
        return axios.get(`${HOST}/api/resource/getResFileFolderByPId`, data);
    },
    // 在文件夹下查询资源
    getResFileFolderResByFileFolderId(data) {
        return axios.get(
            `${HOST}/api/resource/getResFileFolderResByFileFolderId`,
            data,
        );
    },
    // 在文件夹下添加资源
    // addFileFolderRes(data) {
    //     return axios.get(`${HOST}/api/resource/addFileFolderRes`, data);
    // },
    // 删除文件夹
    delFileFolderResById(data) {
        return axios.get(`${HOST}/api/resource/delFileFolderResById`, data);
    },
    // 删除文件夹下资源
    delFileFolderResByResId(data) {
        return axios.get(`${HOST}/api/resource/delFileFolderResByResId`, data);
    },
};
