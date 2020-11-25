import { mapGetters } from 'vuex';
import api from '@/api/passport';
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
        isFolderNameRepeat(name) {
            return this.folder.some(item => item.Name === name);
        },
        // 新建文件夹按钮
        handleNewFolder() {
            let num = 1;
            let name = '新建文件夹';
            while (this.isFolderNameRepeat(name)) {
                console.log(name, 'name');
                name = `新建文件夹(${num})`;
                num += 1;
            }
            const obj = {
                Name: name,
                ResId: '1111',
                AddTime: new Date().getTime() / 1000,
                fileSize: '',
                newFile: true,
                Suffix: 'folder',
                renameStatus: true,
            };
            this.data1.unshift(obj);
            setTimeout(() => {
                this.handleFolderRename(obj, 'addFolder');
            }, 50);
        },
        // 文件夹重命名
        handleFolderRename(item, type) {
            const { ResId } = item;
            const element = this.$refs[ResId];
            const initVal = element.innerText;
            const input = "<input type='text' class='ivu-input' id='temp' style='width:100%;height:25px;' >";
            element.innerHTML = input;
            const tempObj = document.getElementById('temp');
            tempObj.value = initVal;
            tempObj.focus();

            const len = tempObj.value.length;
            if (document.selection) {
                const sel = tempObj.createTextRange();
                sel.moveStart(0, len);
                sel.collapse();
                sel.select();
            }
            const addFolderParam = {
                name: tempObj.value,
                loginId: this.userInfo.loginid,
                pid: this.fileFolderId === 'none' ? 0 : this.fileFolderId,
                level: this.fileFolderId === 'none' ? 1 : (this.level += 1),
                sort: 1,
                wdUserId: this.userInfo.loginid,
                resType: this.resType,
                chapId: this.current.chapterId,
            };
            tempObj.onkeydown = (e) => {
                const code = e.keyCode;
                if (code === 13) {
                    // eslint-disable-next-line no-param-reassign
                    item.renameStatus = false;
                    tempObj.onblur = null;
                    element.innerText = tempObj.value;
                    if (this.isFolderNameRepeat(tempObj.value)) {
                        this.$Message.info('文件夹名称已存在');
                        element.innerText = initVal;
                        if (type !== 'addFolder') {
                            return;
                        }
                    }
                    addFolderParam.name = element.innerText;
                    this.openMainSpin(true);
                    if (type === 'addFolder') {
                        // 如果是新建文件夹
                        this.addOrRenameFolderFunction(addFolderParam, type);
                    } else {
                        this.addOrRenameFolderFunction(
                            {
                                id: ResId,
                                wdUserId: this.userInfo.loginid,
                                name: tempObj.value,
                            },
                            type,
                        );
                    }
                }
            };
            tempObj.onblur = () => {
                // eslint-disable-next-line no-param-reassign
                item.renameStatus = false;
                if (type === 'addFolder') {
                    element.innerText = tempObj.value;
                    if (this.isFolderNameRepeat(tempObj.value)) {
                        this.$Message.info('文件夹名称已存在');
                        element.innerText = initVal;
                    }
                    addFolderParam.name = element.innerText;
                    // 如果是新建文件夹
                    this.openMainSpin(true);
                    this.addOrRenameFolderFunction(addFolderParam, type);
                } else {
                    element.innerText = initVal;
                }
            };
        },
        addOrRenameFolderFunction(param, type) {
            const renameapi = {
                addFolder: 'addResFileFolder',
                renameFolder: 'updateResFileFolderNameById',
            };
            api[renameapi[type]](param)
                .then(
                    () => {
                        this.folderReset();
                    },
                    (data) => {
                        this.folderReset();
                        console.log(data, 'daa111');
                        this.openMainSpin(false);
                    },
                )
                .catch(() => {
                    this.openMainSpin(false);
                });
        },
        handleDeleteFolder(row) {
            this.$Modal.confirm({
                title: '删除提示',
                content: '<p>删除后数据将无法恢复，是否确认删除？</p>',
                onOk: () => {
                    api.delFileFolderResById({
                        id: row.id,
                        wdUserId: this.userInfo.loginid,
                        resType: this.resType,
                        chapId: this.current.chapterId,
                    })
                        .then(() => {
                            if (
                                this.$store.state.app.nextWayArr.length > 0
                                && this.$store.state.app.nextWayArr[0].name
                                    === row.Name
                            ) {
                                this.$store.commit('changenextWayArr', '');
                            }
                            console.log(
                                row,
                                this.$store.state.app.nextWayArr,
                                'this.$store.state.app.nextWayArr',
                            );

                            this.folderReset();
                        })
                        .catch(() => {
                            this.openMainSpin(false);
                        });
                },
            });
        },
        // 查询文件夹
        getFolder(pid) {
            const params = {
                wdUserId: this.userInfo.loginid,
                resType: this.resType,
                chapId: this.current.chapterId,
                pid: pid || 0,
            };
            return api
                .getResFileFolderByPId(params)
                .then(({ data }) => {
                    this.folder = data.map(item => ({
                        ...item,
                        Suffix: 'folder',
                        ResId: item.id,
                        Name: item.name,
                        AddTime: item.addTime,
                        _disabled: true,
                    }));
                    return this.folder;
                })
                .catch(() => {
                    this.openMainSpin(false);
                });
        },
        getResFileFolderResByFileFolderId(fileFolderId) {
            console.log(fileFolderId, 'fileFolderId11');
            const params = {
                fileFolderId,
            };
            return api
                .getResFileFolderResByFileFolderId(params)
                .then(({ data }) => {
                    this.newFolderFiles = data;
                    return data;
                })
                .catch(() => {
                    this.openMainSpin(false);
                });
        },
    },
};
