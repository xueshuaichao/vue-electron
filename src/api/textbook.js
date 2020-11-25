/* eslint-disable import/no-cycle */
import { axios } from '../libs/axios';
import config from '../config/url';

const HOST = config.API;

const host = `${HOST}/api`;

export default {
    getStage(data = {}) {
        return axios.get(`${host}/basic/getStageList`, data);
    },
    getSubject(data = {}) {
        return axios.get(`${host}/basic/getSubjectList`, data);
    },
    getVersion(data) {
        return axios.get(`${host}/basic/getFilterVersion`, data);
    },
    getFascicle(data) {
        return axios.get(`${host}/basic/getFilterFas`, data);
    },
    getChapter(data) {
        return axios.get(`${host}/basic/getFilterChapter`, data);
    },
    add(data) {
        return axios.post(`${host}/user/saveUserTextBookByLoginId`, data);
    },
    getList(data) {
        return axios.get(`${host}/user/getUserTextBookByLoginId`, data);
    },
};
