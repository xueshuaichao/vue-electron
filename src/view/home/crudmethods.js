/* eslint-disable no-underscore-dangle */
// import { mapGetters } from 'vuex';
import api from '@/api/passport';

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
        handleToMyResourceAll() {
            console.log(this.selection2, 'selection2');
            this.openMainSpin(true);
            this.selection2.forEach((item) => {
                if (!this.collectList.includes(Number(item.ResId))) {
                    api.collect({
                        type: 1, // 1收藏，0取消收藏
                        resId: item.ResId,
                        wdUserId: this.userInfo.loginid,
                    })
                        .then((data) => {
                            if (data.code !== '0') {
                                this.$Message.error('添加失败');
                            }
                            this.openMainSpin(false);
                        })
                        .catch(() => {
                            this.openMainSpin(false);
                        });
                }
            });
            setTimeout(() => {
                if (this.fileFolderId === 'none') {
                    this.resetCollectList();
                } else {
                    this.handleGetResList(
                        {
                            type: 3,
                            resType: this.resType,
                            chapterId: this.chapterId,
                            page: 'detail',
                        },
                        () => {
                            this.openMainSpin(false);
                        },
                    );
                    this.$Message.info('已添加到左侧我的资源列表中');
                }
            }, 1000);
        },
        handleDeleteFile(row) {
            const item = {
                ...row,
            };
            if (item.collect) {
                // 取消收藏
                this.handleCollect(item, 0);
            } else {
                this.$Modal.confirm({
                    title: '删除提示',
                    content: '<p>删除后数据将无法恢复，是否确认删除？</p>',
                    onOk: () => {
                        this.openMainSpin(true);
                        if (this.fileFolderId === 'none') {
                            // 删除资源文件夹下的资源
                            api.delRes({
                                resId: item.ResId,
                                wdUserId: this.userInfo.loginid,
                            })
                                .then(() => {
                                    this.$Message.success('删除成功');
                                    this.renameResFileReset();
                                })
                                .catch(() => {
                                    this.openMainSpin(false);
                                });
                        } else {
                            // 删除文件夹下的资源
                            api.delFileFolderResByResId({
                                id: this.fileFolderId,
                                resId: item.ResId,
                                wdUserId: this.userInfo.loginid,
                            })
                                .then(() => {
                                    this.$Message.success('删除成功');
                                    this.renameFolderFileReset();
                                })
                                .catch(() => {
                                    this.openMainSpin(false);
                                });
                        }
                    },
                });
            }
        },
        // 收藏或取消收藏
        handleCollect(item, type) {
            this.openMainSpin(true);
            console.log(type, 'type');
            api.collect({
                type, // 1收藏，0取消收藏
                resId: item.ResId,
                wdUserId: this.userInfo.loginid,
            })
                .then((data) => {
                    if (data.code === '0') {
                        if (type === 1) {
                            this.$Message.success('已添加到左侧我的资源列表中');
                        } else {
                            this.$Message.success('删除成功');
                        }
                        if (this.fileFolderId === 'none') {
                            this.resetCollectList();
                        } else {
                            this.handleGetResList(
                                {
                                    type: 3,
                                    resType: this.resType,
                                    chapterId: this.chapterId,
                                    page: 'detail',
                                },
                                () => {
                                    this.openMainSpin(false);
                                },
                            );
                        }
                    } else {
                        this.$Message.error('出错啦~');
                    }
                })
                .catch(() => {
                    this.openMainSpin(false);
                });
        },
        handleFileRename(item) {
            const id = item.ResId;
            const element = this.$refs[id];
            const initVal = element.innerText;
            console.log(initVal, 'initVal333');
            const input = "<input type='text' class='ivu-input' id='temp' style='width:100%;height:25px;'>";
            element.innerHTML = input;
            const tempObj = document.getElementById('temp');
            tempObj.value = initVal;
            tempObj.focus();
            const tValue = tempObj.value;

            let len = tempObj.value.length;
            if (
                tValue.endsWith('.png')
                || tValue.endsWith('.doc')
                || tValue.endsWith('.xls')
                || tValue.endsWith('.pdf')
                || tValue.endsWith('.rar')
                || tValue.endsWith('.ppt')
            ) {
                len -= 4;
            }
            if (document.selection) {
                const sel = tempObj.createTextRange();
                sel.moveStart(0, len);
                sel.collapse();
                sel.select();
            }
            tempObj.onkeydown = (e) => {
                const code = e.keyCode;
                if (code === 13) {
                    // eslint-disable-next-line no-param-reassign
                    item.renameStatus = false;
                    tempObj.onblur = null;
                    element.innerText = tempObj.value;
                    this.onRenameFilename({
                        resId: item.ResId,
                        wdUserId: this.userInfo.loginid,
                        name: tempObj.value,
                        resType: this.resType,
                        isPublic: 2,
                    });
                }
            };
            tempObj.onblur = () => {
                // eslint-disable-next-line no-param-reassign
                item.renameStatus = false;
                element.innerText = initVal;
            };
        },
        onRenameFilename(param) {
            this.openMainSpin(true);
            api.updateRes(param)
                .then((data) => {
                    console.log(data);
                    if (this.fileFolderId === 'none') {
                        // 资源类型下的文件被重命名后重新请求
                        this.renameResFileReset();
                    } else {
                        // 文件类型下的文件被重命名后重新请求
                        this.renameFolderFileReset();
                    }
                })
                .catch(() => {
                    this.openMainSpin(false);
                });
        },
        handleMore() {
            this.$refs.cloud.handleShow();
        },
        handleSelectChange1(selection) {
            this.selection1 = selection;
            const selectArr = [];
            selection.forEach((item) => {
                selectArr.push(item.ResId);
            });
            this.data1.forEach((item) => {
                // eslint-disable-next-line no-underscore-dangle
                // eslint-disable-next-line no-param-reassign
                item._checked = selectArr.includes(item.ResId);
            });
        },
        handleSelectChange2(selection) {
            this.selection2 = selection;
            const selectArr = [];
            selection.forEach((item) => {
                selectArr.push(item.ResId);
            });
            this.cloudData.forEach((item) => {
                // eslint-disable-next-line no-param-reassign
                item._checked = selectArr.includes(item.ResId);
            });
        },
        handleSearch(msg) {
            this.$router.push({
                params: {
                    keyword: msg,
                    resType: this.resType,
                },
                name: 'search',
            });
        },
        cancel() {
            this.modal1 = false;
        },
    },
};
