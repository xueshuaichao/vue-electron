/**
 * @des 资源
 */
import { axios } from '../libs/axios';
import api from './textbook';
import config from '../config/url';

const HOST = config.API;

const baseUrl = `${HOST}/api/resource/`;

export default {
    ...api,
    getModuleList(data) {
        return axios.get(`${baseUrl}getModuleList`, data);
    },
    getResourcesList(data) {
        return axios.get(`${baseUrl}getResList`, data);
    },
    addResource(data) {
        return axios.post(`${baseUrl}addPreRes`, data);
    },
    collect(data) {
        return axios.get(`${baseUrl}collect`, data);
    },
};
