import { mapGetters } from 'vuex';
// import api from '@/api/passport';
// import resourceApi from '@/api/resources';

import store from '../../store';

// import db from '../../database';

const { ipcRenderer } = require('electron');
const path = require('path');

export default {
    data() {
        return {
            path: '',
            downloadTimestamp: new Date().getTime(),
        };
    },
    computed: {
        ...mapGetters({
            current: 'curTextbook',
            userAppConfig: 'userAppConfig',
        }),
    },
    methods: {
        downloadFunction(row, index) {
            let name = row.Name;
            if (name.includes('keyField')) {
                name = name
                    .replace(/<font class='keyField' >/g, '')
                    .replace(/<\/font>/g, '');
            }
            if (!row.upUrl) {
                this.$Message.info(`${name}没有下载路径`);
                return;
            }
            const { downloadItems } = store.state.app;
            this.downloadTimestamp += 1;
            const filename = row.upUrl.substr(row.upUrl.lastIndexOf('/') + 1);
            const downloadParam = {
                url: row.upUrl.includes(':80/')
                    ? row.upUrl.replace(':80/', '/')
                    : row.upUrl,
                name,
                status: 'pending',
                type: 'download',
                ResId: row.ResId,
                downloadTimestamp: this.downloadTimestamp,
                index: index || 0,
                path: path.join(this.userAppConfig.userDownloadPath, filename),
                userDownloadPath: this.userAppConfig.userDownloadPath,
                uid: this.$store.state.textbook.uid,
                filename,
            };

            let result = '';
            const everDownload = downloadItems.filter((item) => {
                if (item.ResId === row.ResId && item.type === 'download') {
                    if (item.status === 'downloading') {
                        result = 'downloading';
                    } else if (result !== 'downloading') {
                        result = 'complete';
                    }
                    return item;
                }
                return false;
            });
            if (result === 'downloading') {
                // 还没有处理批量下载过文件的展示问题，
                this.$Message.info(`${name}正在下载`);
                return;
            }
            if (result === 'complete') {
                const lastIndex = name.lastIndexOf('.');
                downloadParam.name = `${name.substring(0, lastIndex)}(${
                    everDownload.length
                })${name.substring(lastIndex)}`;
                downloadParam.path = path.join(
                    this.userAppConfig.userDownloadPath,
                    downloadParam.name,
                );
                // 如果遇到多个重复下载，只下载最后一个，因为downloadParam会覆盖，提示也会覆盖，
            }
            store.commit('setDownloadItems', {
                index: downloadItems.length,
                item: downloadParam,
            });
            // this.$Message.info(`${downloadParam.name}开始下载`);
            ipcRenderer.send('custom-download', downloadParam);
        },
    },
};
