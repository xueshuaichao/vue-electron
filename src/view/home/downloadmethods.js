import { mapGetters } from 'vuex';
// import api from '@/api/passport';
// import resourceApi from '@/api/resources';

// import store from '../../store';

// import db from '../../database';

// const { ipcRenderer } = require('electron');
// const path = require('path');

export default {
    data() {
        return {};
    },
    computed: {
        ...mapGetters({}),
    },
    mounted() {},
    methods: {
        // 多个下载
        handleAllDownload(sigleAllow) {
            const arr = [...this.selection1, ...this.selection2];
            if (
                (!this.userAppConfig.userDownloadPath
                    || !this.userAppConfig.isDownloadPath)
                && !sigleAllow
            ) {
                if (this.userAppConfig.userDownloadPath) {
                    this.path = this.userAppConfig.userDownloadPath;
                } else {
                    this.path = this.$remote.app.getPath('downloads');
                }
                let fileNames = '';
                // let fileSizes = 0;
                arr.forEach((item) => {
                    let name = item.Name;
                    if (name.includes('keyField')) {
                        name = name
                            .replace(/<font class='keyField' >/g, '')
                            .replace(/<\/font>/g, '');
                    }
                    fileNames += `/${name}`;
                    // fileSizes += item.size;
                });
                console.log(fileNames.slice(1), 'fileNames');
                this.setPathParam = {
                    name: fileNames.slice(1),
                    // size: formateFileSize(fileSizes),
                };
                this.setPathOkParam = {
                    function: 'all',
                };
                this.modal1 = true;
                return;
            }

            arr.forEach((item, index) => {
                this.downloadFunction(item, index);
            });
        },
        // 单个下载
        handleSingleDownload(row, sigleAllow) {
            console.log(row, 'row');
            if (
                (!this.userAppConfig.userDownloadPath
                    || !this.userAppConfig.isDownloadPath)
                && !sigleAllow
            ) {
                if (this.userAppConfig.userDownloadPath) {
                    this.path = this.userAppConfig.userDownloadPath;
                } else {
                    this.path = this.$remote.app.getPath('downloads');
                }
                let name = row.Name;
                if (name.includes('keyField')) {
                    name = name
                        .replace(/<font class='keyField' >/g, '')
                        .replace(/<\/font>/g, '');
                }
                this.setPathParam = {
                    name,
                    // size: formateFileSize(row.size),
                };
                this.setPathOkParam = {
                    function: 'single',
                    row,
                };
                this.modal1 = true;
                return;
            }
            this.downloadFunction(row);
        },
        ok() {
            this.modal1 = false;
            if (this.setPathOkParam.function === 'all') {
                this.handleAllDownload(true);
            } else {
                this.handleSingleDownload(this.setPathOkParam.row, true);
            }
        },
    },
};
