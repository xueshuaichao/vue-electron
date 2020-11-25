<template>
    <div class="home">
        <setPath
            :modal1="modal1"
            :set-path-param="setPathParam"
            :path="path"
            @ok="ok"
            @cancel="cancel"
        />
        <tool-bar
            @refresh="handleRefresh"
            @search="handleSearch"
        >
            <template slot="header-btn">
                <Button
                    type="primary"
                    icon="md-arrow-up"
                    disabled
                >
                    上传
                </Button>
                <Button
                    icon="md-download"
                    :disabled="selectedBol"
                    @click="handleDownload"
                >
                    下载
                </Button>
                <Button
                    icon="md-folder"
                    disabled
                >
                    新建文件夹
                </Button>
            </template>
        </tool-bar>
        <div
            ref="mainBox"
            class="mainBox"
            @mouseup="handleMouseup"
            @mousedown="handlemainMousedown"
        >
            <loading-spin />
            <div
                v-for="item in fileList"
                :id="item.typeId"
                :key="item.name"
                ref="fileFolder"
                :resType="item.typeId"
                :class="item.disabled ? 'file-folder selected' : 'file-folder'"
                @dblclick="handledblClick(item)"
                @mousedown="handleMousedown"
                @drop.stop="handleDrop($event, item)"
                @dragover="handleDragOver($event)"
                @dragenter.stop="handleDragEnter($event, item)"
                @dragleave.stop="handleDragLeave($event, item)"
                @contextmenu="handlecontextmenu(item)"
            >
                <div class="one">
                    <img
                        v-if="item.have"
                        src="../../assets/images/app/file_have.png"
                    >
                    <img
                        v-else
                        src="../../assets/images/app/file_empty.png"
                    >
                    <img
                        v-if="item.onuploading !== 0"
                        class="uploading-icon"
                        src="../../assets/images/app/uploading.png"
                    >
                    <p>{{ item.name }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import { mapActions, mapGetters, mapMutations } from 'vuex';
import { v4 as uuidv4 } from 'uuid';
import toolBar from '@/components/toolBar/index.vue';
import api from '@/api/passport';
import resourceApi from '@/api/resources';
import setPath from '@/components/setPath/index.vue';
import loadingSpin from '@/components/loadingSpin/index.vue';
import store from '../../store';
import commonmethods from './commonmethods';
import uploadmethods from './uploadmethods';

const { remote } = require('electron');

const { Menu, MenuItem } = remote;

export default {
    name: 'Home',
    components: {
        toolBar,
        setPath,
        loadingSpin,
    },
    mixins: [commonmethods, uploadmethods],
    data() {
        return {
            visible: true,
            fileList: [],
            preList: [],
            selectedList: [],
            selectedBol: true,
            uploadNum: 0,
            uploadQueue: [],
            resType: 0,
            modal1: false,
            downloadData: [],
            setPathParam: {},
        };
    },
    computed: {
        ...mapGetters({
            userInfo: 'userInfo',
            current: 'curTextbook',
        }),
    },
    created() {
        this.downloadTimestamp = new Date().getTime();
        this.getData();
    },
    beforeRouteEnter(to, from, next) {
        console.log('abc');
        // 在渲染该组件的对应路由被 confirm 前调用
        // 不！能！获取组件实例 `this`
        // 因为当守卫执行前，组件实例还没被创建
        next();
    },
    mounted() {
        // circleSelect(this.$refs.mainBox, this.handleMouseup, {
        //     x: 207,
        //     y: 63,
        // });
        // this.$refs.mainBox.onmousedown = function() {
        // }
        // this.$refs.mainBox.onmouseup = this.handleMouseup;
    },
    methods: {
        ...mapActions(['setResType']),
        ...mapMutations(['openMainSpin']),
        getData() {
            this.openMainSpin(true);
            this.setResType('');
            api.getModuleList({
                modId: 5,
            })
                .then(({ data }) => {
                    this.openMainSpin(false);
                    data.forEach((item) => {
                        // eslint-disable-next-line no-param-reassign
                        item.disabled = false;
                        // eslint-disable-next-line no-param-reassign
                        item.onuploading = 0;
                    });
                    this.fileList = data;
                })
                .catch(() => {
                    this.openMainSpin(false);
                });
        },
        handleRefresh() {
            this.getData();
        },
        handleMouseup() {
            this.selectedList = [
                ...document.getElementsByClassName('selected'),
            ];
            // this.selectedBol = this.selectedList.length === 0;
        },
        handlecontextmenu(item) {
            const that = this;
            const menu = new Menu();
            menu.append(
                new MenuItem({
                    label: '打开',
                    click() {
                        that.handledblClick(item);
                    },
                }),
            );
            menu.append(new MenuItem({ type: 'separator' })); // 分割线
            menu.append(
                new MenuItem({
                    label: '下载',
                    click() {
                        console.log('item 1 clicked');
                        that.handleDownload();
                    },
                }),
            );
            menu.popup({ window: remote.getCurrentWindow() });
        },

        handleDownload() {
            this.openMainSpin(true);
            console.log(
                document.getElementsByClassName('selected')[0].id,
                'aaa',
            );
            const resType = document.getElementsByClassName('selected')[0].id;
            this.getResList(resType);
        },
        // 获取文件列表
        getResList(resType) {
            const p = Promise.all([
                new Promise((resolve) => {
                    resolve(
                        this.handleGetResList({
                            type: 2,
                            resType,
                            chapterId: this.chapterId,
                            page: 'home',
                        }),
                    );
                }),
                new Promise((resolve) => {
                    resolve(
                        this.handleGetResList({
                            type: 3,
                            resType,
                            chapterId: this.chapterId,
                            page: 'home',
                        }),
                    );
                }),
            ]);
            p.then((ret) => {
                this.openMainSpin(false);
                console.log(ret, 'res');
                this.downloadData = [...ret[0], ...ret[1]];
                if (this.downloadData.length === 0) {
                    this.$Message.info('该文件夹为空');
                }
                this.handleAllDownload(false);
            }).catch(() => {
                this.openMainSpin(false);
            });
        },
        handleSearch({ value, holderType }) {
            console.log(holderType, 'aaa');
            const routeParam = {
                name: 'HomeDetail',
                params: {
                    chapterId:
                        holderType === 'all' ? '' : this.current.chapterId,
                    resType: '',
                    fileFolderId: 'none',
                },
                query: {
                    keyword: value,
                },
            };
            store.commit('changenextWayArr', '');
            const { way } = store.state.app;
            const currentWay = way[way.length - 1];
            if (currentWay.type === 'search') {
                Vue.set(way, way.length - 1, {
                    name: `“${value}”的搜索结果：`,
                    type: 'search',
                    holderType,
                    chapterId: this.current.chapterId,
                    routeParam: { ...routeParam },
                });
            } else {
                way.push({
                    name: `“${value}”的搜索结果：`,
                    type: 'search',
                    holderType,
                    chapterId: this.current.chapterId,
                    routeParam: { ...routeParam },
                });
            }
            // console.log(routeParam, 'routeParam11');
            store.commit('changeWay', way);
            this.$router.push(routeParam);
        },
        handleAllDownload(sigleAllow) {
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
                this.downloadData.forEach((item) => {
                    fileNames += `/${item.Name}`;
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

            this.downloadData.forEach((item, index) => {
                this.downloadFunction(item, index);
            });
        },
        ok() {
            this.modal1 = false;
            this.handleAllDownload(true);
        },
        handledblClick({ name, typeId }) {
            console.log(name, typeId, 'typeId');
            const routeParam = {
                name: 'HomeDetail',
                params: {
                    chapterId: this.$store.state.textbook.current.chapterId,
                    resType: typeId,
                    fileFolderId: 'none',
                },
            };
            store.commit('changenextWayArr', '');
            const { way } = store.state.app;
            way.push({
                name,
                chapterId: this.$store.state.textbook.current.chapterId,
                routeParam,
            });
            store.commit('changeWay', way);
            this.$router.push(routeParam);
        },
        handlemainMousedown(e) {
            if (
                e.target.className === 'mainBox'
                && this.selectedList.length > 0
            ) {
                // 如果数组里有值并且没有按住ctrl
                this.selectedList.forEach((item) => {
                    item.className = "file-folder"; // eslint-disable-line
                });
                this.selectedList.length = 0; // 让数组清零
            }
        },
        handleMousedown(e) {
            this.preChange(e.currentTarget, false);
        },
        preChange(ele, bool) {
            if (this.selectedList.length > 0 && !bool) {
                // 如果数组里有值并且没有按住ctrl
                this.selectedList.forEach((item) => {
                    item.className = "file-folder"; // eslint-disable-line
                });
                this.selectedList.length = 0; // 让数组清零
            }
            this.selectedList.push(ele); // 把当前点击的这一项添加到数组里,设置样式,如果按住ctrl,直接把每一项设置样式
            ele.className += " selected"; // eslint-disable-line
        },
        handleDrop(e, row) {
            e.preventDefault();
            console.log(row, 'item');
            this.resType = row.typeId;
            row.disabled = false; // eslint-disable-line
            row.uploading = true; // eslint-disable-line
            const fileList = [...e.dataTransfer.files]; // 获取文件对象
            // eslint-disable-next-line no-param-reassign
            row.onuploading += fileList.length;
            fileList.forEach((item) => {
                // this.checkEverUpload(item);
                this.addUploadQueue(item);
            });
            // 检查是否有待上传的队列
            setTimeout(() => {
                this.checkisUploadWait(row);
            }, 500);
        },
        handleDragOver(e) {
            e.preventDefault();
        },
        handleDragEnter(e, item) {
            e.preventDefault();
            item.disabled = true; // eslint-disable-line
        },
        handleDragLeave(e, item) {
            e.preventDefault();
            item.disabled = false; // eslint-disable-line
        },
        checkEverUpload1(file) {
            const regexAll = /[^\\]*\.(\w+)$/;
            const filenames = file.name.match(regexAll);
            const extension = filenames[1];
            const renameFile = new File([file], `${uuidv4()}.${extension}`, {
                type: file.type,
            });
            const { downloadItems } = store.state.app;
            const { resType } = this;
            const result = downloadItems.filter(
                item => item.name === file.name && item.status === 'downloading',
            );
            if (result.length > 0) {
                this.$Message.info(`${file.name}正在上传`);
                return;
            }
            const uploadTimestamp = new Date().getTime();
            store.commit('setDownloadItems', {
                index: downloadItems.length,
                item: {
                    name: file.name,
                    type: 'upload',
                    uploadTimestamp,
                    status: 'pending',
                },
            });
            this.uploadQueue.push({
                path: file.path,
                body: renameFile,
                name: file.name,
                fileName: renameFile.name,
                type: 'upload',
                uploadTimestamp,
                resType,
                wdStageId: this.current.wdStageId, // 学段
                wdSubjectId: this.current.wdSubjectId, // 学科
                versionId: this.current.versionId, // 版本 id
                fasId: this.current.fasId, // 分册 id
                chapBranId: this.current.chapterId, // 章节
                way: JSON.parse(JSON.stringify(this.$store.state.app.way)),
            });
        },
        addResource(param, callback) {
            const curTextbook = this.current;
            resourceApi
                .addResource({
                    fileUrl: param.fileUrl,
                    fileName: param.name,
                    fileSize: param.fileSize,
                    // 素材
                    resType: param.resType,
                    wdStageId: param.wdStageId,
                    wdSubjectId: param.wdSubjectId,
                    versionId: param.versionId,
                    fasId: param.fasId,
                    chapBranId: param.chapBranId,
                    wdSiteId: curTextbook.wdSiteId,
                    isPublic: 0,
                    wdUserId: this.userInfo.loginid,
                    roleId: 2,
                    type: 1,
                    // 资源分类
                    bigType: 1,
                    CheckStatus: 3,
                })
                .then((data) => {
                    // eslint-disable-next-line no-unused-expressions
                    callback && callback(data);
                    console.log(data, '添加成功');
                })
                .catch(() => {
                    this.openMainSpin(false);
                });
        },
        cancel() {
            this.modal1 = false;
        },
    },
};
</script>

<style lang="less" scoped>
.home {
    width: 100%;
    height: 100%;
    color: #2c3e50;
    display: flex;
    flex-flow: column;
    .mainBox {
        background: #f6f7f9;
        flex: 1;
        overflow: scroll;
        position: relative;
        user-select: none;
        .getDiv {
            background: #cce8ff;
        }
        .file-folder {
            float: left;
            width: 81px;
            margin-top: 26px;
            text-align: center;
            margin-left: 64px;
            border: 1px solid transparent;
            position: relative;
            cursor: pointer;
            &:hover {
                background: #d8eaf9;
            }
            &:active {
                background: #cce8ff;
            }
            .one {
                pointer-events: none;
                .uploading-icon {
                    position: absolute;
                    top: 27px;
                    left: 31px;
                }
            }
        }
        .selected {
            border: 1px solid #99d1ff;
            background: #cce8ff;
        }
    }
}
</style>
