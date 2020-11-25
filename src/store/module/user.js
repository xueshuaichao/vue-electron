/**
 * @des user store
 */
import { remote } from 'electron';
import router from '../../router';
// eslint-disable-next-line import/no-cycle
import api from '../../api/passport';
import db from '../../database';

const { appConfig } = db;
export default {
    state: {
        userInfo: '',
        loginInfo: '',
        userAppConfig: {
            isAutoStart: true,
            isAutoUpgrade: false,
            userDownloadPath: '',
            isDownloadPath: false,
            status: 'insert',
        },
    },
    getters: {
        wdSiteId(state) {
            return state.userInfo.user_org.find(v => v.identity === '04')
                .school_id;
        },
        userInfo(state) {
            return state.userInfo;
        },
        loginInfo(state) {
            return state.userInfo;
        },
        userDownloadPath(state) {
            return state.userAppConfig.userDownloadPath;
        },
        userAppConfig(state) {
            return state.userAppConfig;
        },
    },
    mutations: {
        setUserInfo(state, info) {
            state.userInfo = info;
        },
        setLoginInfo(state, info) {
            state.loginInfo = info;
        },
        setUserAppConfig(state, data) {
            state.userAppConfig = { ...state.userAppConfig, ...data };
        },
    },
    actions: {
        initAppConfig(store, { uid }) {
            appConfig.find({ _id: uid }, (err, doc) => {
                if (err) return;
                if (doc.length) {
                    store.commit('setUserAppConfig', {
                        ...doc[0],
                        status: 'update',
                    });
                }
            });
        },
        setUserDownloadPath(store, { userDownloadPath }) {
            store.commit('setUserAppConfig', { userDownloadPath });
            store.dispatch('updateUserAppConfigOfDb', {
                userDownloadPath,
                isDownloadPath: true,
            });
        },
        updateUserAppConfigOfDb(store, data) {
            const { uid } = store.state.userInfo;
            const { userAppConfig } = store.state;

            if (userAppConfig.status === 'update') {
                appConfig.update(
                    { _id: uid },
                    { ...store.state.userAppConfig, ...data },
                    (err, nums, docs) => {
                        console.log('db: update app config', err, docs);
                    },
                );
            } else {
                appConfig.insert({ _id: uid, ...data }, (err, docs) => {
                    console.log('db: insert app config', err, docs);
                    store.commit('setUserAppConfig', { status: 'update' });
                });
            }
        },
        loginOut() {
            return api.loginOut();
        },
        loginSync(store, data) {
            return api.loginSync(data);
        },
        selectUserType(store, data) {
            return api.selectUserType(data);
        },
        reLogin() {
            const current = remote.getCurrentWindow();
            router.push('/login');
            current.setSize(720, 480);
            current.center();
        },
    },
};
