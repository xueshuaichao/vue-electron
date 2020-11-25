/**
 * @file
 * @author tanghao
 * @date 2019-06-19
 */
import Vue from 'vue';

export default {
    state: {
        path: 'home',
        // directory
        dir: [],
        way: [], // 当前的路径。
        openMainSpin: false,
        mainSpinText: '',
        uploadNum: 0,
        downloadNum: 0,
        completeNum: 0,
        downloadItems: [],
        completeItems: [],
        nextWayArr: [],
        uploadStatus: {},
        dataList: [],
    },
    getters: {
        uploadNum(state) {
            return state.downloadItems.filter(
                item => item.status !== 'completed'
                    && item.status !== 'canceled'
                    && item.status !== 'failed'
                    && item.status !== 'deleted'
                    && item.type === 'upload',
            ).length;
        },
        downloadNum(state) {
            return state.downloadItems.filter(
                item => item.status !== 'completed'
                    && item.status !== 'canceled'
                    && item.status !== 'failed'
                    && item.status !== 'deleted'
                    && item.type === 'download',
            ).length;
        },
        completeNum(state) {
            return state.downloadItems.filter(
                item => item.status === 'completed' || item.status === 'failed',
            ).length;
        },
        downloadItems(state) {
            return state.downloadItems;
        },
        downloadedFile(state) {
            const arr = [];
            state.downloadItems.forEach((item) => {
                if (item.status === 'completed') {
                    arr.push(item);
                }
            });
            return arr;
        },
    },
    mutations: {
        updateData(state, data) {
            state.dataList = data;
        },
        setPath(state, path) {
            state.path = path;
        },
        setDir(state, dir) {
            console.log(dir);
            state.dir = dir;
        },
        changeWay(state, way) {
            state.way = way;
        },
        changeUploadNum(state, num) {
            state.uploadNum = num;
        },
        changeDownloadNum(state, num) {
            state.downloadNum = num;
        },
        setDownloadItems(state, params) {
            Vue.set(state.downloadItems, params.index, params.item);
        },
        initDownloadItems(state, params) {
            state.downloadItems = params;
        },
        openMainSpin(state, data) {
            if (typeof data === 'object') {
                state.openMainSpin = data.open;
                state.mainSpinText = data.text;
            } else {
                state.openMainSpin = data;
                state.mainSpinText = '加载中...';
            }
        },
        changenextWayArr(state, data) {
            if (data) {
                state.nextWayArr.unshift(data);
            } else {
                state.nextWayArr = [];
            }
        },
        changeUploadStatus(state, data) {
            // state.uploadStatus[data.key] = data.value;
            state.uploadStatus = { ...state.uploadStatus, ...data };
        },
    },
    actions: {
        goTo({ commit }, path) {
            commit('setPath', path.toLowerCase());
        },
    },
};
