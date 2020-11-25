// import { mapGetters } from 'vuex';
// import api from '@/api/passport';

// import store from '../../store';

// import db from '../../database';

// const { ipcRenderer } = require('electron');
// const path = require('path');

export default {
    data() {
        return {};
    },
    computed: {},
    mounted() {},
    methods: {
        // 文件夹新建，重命名，删除后，重新请求
        folderReset() {
            const p = new Promise((resolve) => {
                console.log(this.fileFolderId, 'this.fileFolderId44');
                resolve(this.getFolder(this.fileFolderId));
            });
            p.then((ret) => {
                if (this.fileFolderId !== 'none') {
                    this.newFolderFiles.sort((a, b) => b.AddTime - a.AddTime);
                    this.data1 = [...ret, ...this.newFolderFiles];
                } else {
                    const arr = [...this.myCollectData, ...this.myUploadData];
                    arr.sort((a, b) => b.AddTime - a.AddTime);
                    this.data1 = [...ret, ...arr];
                }
                setTimeout(() => {
                    this.openMainSpin(false);
                    this.addEventListener1();
                }, 500);
            }).catch(() => {
                this.openMainSpin(false);
            });
        },
        // 我的资源收藏或取消收藏后，重新请求
        resetCollectList() {
            const p = new Promise((resolve) => {
                resolve(
                    this.handleGetResList({
                        type: 3,
                        resType: this.resType,
                        chapterId: this.chapterId,
                        page: 'detail',
                    }),
                );
            });
            p.then((ret) => {
                const arr = [...ret, ...this.myUploadData];
                arr.sort((a, b) => b.AddTime - a.AddTime);
                this.data1 = [...this.folder, ...arr];
                setTimeout(() => {
                    this.openMainSpin(false);
                    this.addEventListener1();
                }, 500);
            }).catch(() => {
                this.openMainSpin(false);
            });
        },
    },
};
