/* eslint-disable consistent-return */ /* eslint-disable array-callback-return
*/
<template>
    <div class="detail">
        <setPath
            :modal1="modal1"
            :set-path-param="setPathParam"
            :path="path"
            @ok="ok"
            @cancel="cancel"
        />
        <tool-bar
            @search="handleSearch"
            @refresh="handleRefresh"
        >
            <template slot="header-btn">
                <Button
                    type="primary"
                    icon="md-arrow-up"
                    :disabled="!!keyword"
                    @click="openFolder"
                >
                    上传
                </Button>
                <input
                    v-show="false"
                    ref="file"
                    multiple
                    type="file"
                    @change="handleAllUpload"
                >
                <Button
                    icon="md-download"
                    :disabled="
                        selection1.length === 0 && selection2.length === 0
                    "
                    @click="handleAllDownload(false)"
                >
                    下载
                </Button>
                <Button
                    icon="md-folder"
                    :disabled="!!keyword"
                    @click="handleNewFolder"
                >
                    新建文件夹
                </Button>
                <Button
                    v-if="activeMenuIndex === 'cloud-resource' || !!keyword"
                    icon="md-add"
                    :disabled="selection2.length === 0"
                    @click="handleToMyResourceAll"
                >
                    添加
                </Button>
            </template>
        </tool-bar>
        <div
            class="mainBox"
            onselectstart="return false;"
        >
            <div
                v-if="keyword === ''"
                class="title"
            >
                <div @click="handleToggle('my-resource')">
                    <Icon
                        type="ios-folder"
                        color="#0279F7"
                    />我的资源
                </div>
                <div
                    :class="{
                        active: activeMenuIndex === 'cloud-resource'
                    }"
                    @click="
                        handleToggle(
                            activeMenuIndex === 'cloud-resource'
                                ? 'my-resource'
                                : 'cloud-resource'
                        )
                    "
                >
                    <img
                        v-if="activeMenuIndex === 'my-resource'"
                        class="toLeft"
                        src="@/assets/images/app/toleft.png"
                    >
                    <Icon
                        type="ios-cloud"
                        color="#0279F7"
                    />云资源
                    <img
                        v-if="activeMenuIndex === 'cloud-resource'"
                        class="toRight"
                        src="@/assets/images/app/toright.png"
                    >
                    <Button
                        type="primary"
                        size="small"
                        @click.stop="handleMore"
                    >
                        更多资源
                    </Button>
                </div>
            </div>
            <div class="resouce-box">
                <loading-spin />
                <div
                    :class="
                        activeMenuIndex === 'my-resource'
                            ? 'my-resource'
                            : 'my-resource-half'
                    "
                    @drop.stop="handleDrop($event)"
                    @dragover="handleDragOver($event)"
                    @dragenter.stop="handleDragEnter($event)"
                    @dragleave.stop="handleDragLeave($event)"
                >
                    <div
                        v-if="data1.length > 0"
                        id="my-resource"
                    >
                        <Table
                            :animation="false"
                            highlight-row
                            :columns="
                                activeMenuIndex === 'my-resource'
                                    ? columns1
                                    : columns2
                            "
                            :data="data1"
                            @on-selection-change="handleSelectChange1"
                        >
                            <template
                                slot="Name"
                                slot-scope="{ row }"
                            >
                                <div
                                    class="click-box"
                                    @dblclick="handleOpenFileOrFolder(row)"
                                >
                                    <div class="img">
                                        <img
                                            :src="
                                                require(`@/assets/images/app/${getFileIcon(
                                                    row
                                                )}.png`)
                                            "
                                        >
                                        <template v-if="row.uploading">
                                            <img
                                                v-if="row.Suffix === 'folder'"
                                                class="img-loading"
                                                src="@/assets/images/app/uploading2.png"
                                            >
                                            <img
                                                v-else
                                                class="img-loading"
                                                src="@/assets/images/app/uploading1.png"
                                            >
                                        </template>
                                    </div>
                                    <span
                                        :key="row.ResId"
                                        :ref="row.ResId"
                                        class="file-name"
                                        :title="row.Name | formateName"
                                        v-html="row.Name"
                                    >
                                        <!-- {{ row.Name }} -->
                                    </span>
                                </div>

                                <img
                                    v-if="row.collect"
                                    class="cloud"
                                    src="@/assets/images/app/cloudlist.png"
                                >
                            </template>
                            <template
                                slot="AddTime"
                                slot-scope="{ row }"
                            >
                                {{ formateTimeStamp(row.AddTime) }}
                            </template>
                            <template
                                slot="fileSize"
                                slot-scope="{ row }"
                            >
                                {{
                                    row.Suffix === "folder"
                                        ? ""
                                        : row.fileSize || "0M"
                                }}
                            </template>
                            <template
                                v-if="
                                    !row.uploading &&
                                        !row.newFile &&
                                        row.mouseover
                                "
                                slot="action"
                                slot-scope="{ row }"
                            >
                                <Tooltip
                                    v-if="row.Suffix !== 'folder'"
                                    placement="bottom-start"
                                    content="下载"
                                    offset="-10"
                                >
                                    <div
                                        class="icon-opt icon-download"
                                        @click="handleSingleDownload(row)"
                                    />
                                </Tooltip>
                                <Tooltip
                                    v-if="
                                        activeMenuIndex !== 'cloud-resource' ||
                                            row.collect
                                    "
                                    placement="bottom-start"
                                    content="删除"
                                    offset="-10"
                                >
                                    <div
                                        class="icon-opt icon-del"
                                        @click="handleDeleteFileOrFolder(row)"
                                    />
                                </Tooltip>
                                <Poptip
                                    v-if="!row.collect"
                                    content="content"
                                    placement="right"
                                    trigger="hover"
                                >
                                    <div class="icon-opt icon-more" />
                                    <div
                                        slot="content"
                                        class="context"
                                    >
                                        <Card
                                            :bordered="false"
                                            :padding="0"
                                        >
                                            <ul>
                                                <li
                                                    @click="
                                                        handleFileOrFolderRename(
                                                            row
                                                        )
                                                    "
                                                >
                                                    重命名
                                                </li>
                                                <li
                                                    v-if="
                                                        activeMenuIndex ===
                                                            'cloud-resource'
                                                    "
                                                    @click="
                                                        handleDeleteFileOrFolder(
                                                            row
                                                        )
                                                    "
                                                >
                                                    删除
                                                </li>
                                            </ul>
                                        </Card>
                                    </div>
                                </Poptip>
                            </template>
                        </Table>
                        <div class="record">
                            共{{ data1.length }}条记录
                        </div>
                    </div>
                    <div
                        v-else
                        class="file-empty"
                    >
                        <img src="@/assets/images/app/file-empty.png">
                        <p>暂无文件</p>
                        <p v-if="keyword === ''">
                            您可以直接把文件拖进来
                        </p>
                    </div>
                </div>
                <div
                    :class="
                        activeMenuIndex === 'my-resource'
                            ? 'cloud-resource-dis'
                            : 'cloud-resource'
                    "
                >
                    <div
                        v-if="cloudData.length > 0"
                        id="cloud-resource"
                    >
                        <Table
                            ref="selection2"
                            :columns="columns2"
                            :data="cloudData"
                            :animation="false"
                            @on-selection-change="handleSelectChange2"
                        >
                            <template
                                slot="Name"
                                slot-scope="{ row }"
                            >
                                <div
                                    class="click-box"
                                    :title="row.Name"
                                    @dblclick="handleCloudFile(row)"
                                >
                                    <div class="img">
                                        <img
                                            :src="
                                                require(`@/assets/images/app/${getFileIcon(
                                                    row
                                                )}.png`)
                                            "
                                        >
                                    </div>
                                    <span
                                        :key="row.ResId"
                                        class="file-name"
                                    >
                                        {{ row.Name }}
                                    </span>
                                </div>
                                <img
                                    v-if="
                                        collectList.includes(Number(row.ResId))
                                    "
                                    title="已添加"
                                    class="added"
                                    src="@/assets/images/app/success_light.png"
                                >
                            </template>
                            <template
                                slot="AddTime"
                                slot-scope="{ row }"
                            >
                                {{ formateTimeStamp(row.AddTime) }}
                            </template>
                            <template
                                slot="fileSize"
                                slot-scope="{ row }"
                            >
                                {{ row.fileSize || "0M" }}
                            </template>
                            <template
                                v-if="row.mouseover"
                                slot="action"
                                slot-scope="{ row }"
                            >
                                <Tooltip
                                    placement="bottom-start"
                                    content="下载"
                                    offset="-14"
                                >
                                    <div
                                        class="icon-opt icon-download"
                                        @click="handleSingleDownload(row)"
                                    />
                                </Tooltip>
                                <Tooltip
                                    placement="bottom-start"
                                    content="添加"
                                    offset="-14"
                                >
                                    <div
                                        v-if="
                                            !collectList.includes(
                                                Number(row.ResId)
                                            )
                                        "
                                        class="icon-opt icon-add"
                                        @click="handleCollect(row, 1)"
                                    />
                                    <div
                                        v-else
                                        class="icon-opt icon-disable"
                                    />
                                </Tooltip>
                            </template>
                        </Table>
                        <div class="record">
                            共{{ cloudData.length }}条记录
                        </div>
                    </div>
                    <div
                        v-else
                        class="file-empty"
                    >
                        <img src="@/assets/images/app/file-empty.png">
                        <p>暂无文件</p>
                    </div>
                </div>
            </div>
        </div>
        <cloud ref="cloud" />
    </div>
</template>

<script>
import Vue from 'vue';
import {
    mapState, mapGetters, mapActions, mapMutations,
} from 'vuex';
import toolBar from '@/components/toolBar/index.vue';
import loadingSpin from '@/components/loadingSpin/index.vue';
// import resourceApi from '@/api/resources';
import setPath from '@/components/setPath/index.vue';

import config from './config';
import store from '../../store';
import commonmethods from './commonmethods';
import uploadmethods from './uploadmethods';
import search from './search';
import downloadmethods from './downloadmethods';
import crudmethods from './crudmethods';
import resetList from './resetList';
import newFolder from './newFoldermethods';
import { getSuffix, getFileIcon, formateTimeStamp } from '../../utils';

import cloud from '../cloud/index.vue';

const { columns1, columns2 } = config;
const fs = require('fs');
const { shell } = require('electron');

export default {
    components: {
        toolBar,
        setPath,
        cloud,
        loadingSpin,
    },
    filters: {
        formateName(name) {
            let fName = name;
            if (name.includes('keyField')) {
                fName = name
                    .replace(/<font class='keyField' >/g, '')
                    .replace(/<\/font>/g, '');
            }
            return fName;
        },
    },
    mixins: [
        commonmethods,
        newFolder,
        uploadmethods,
        downloadmethods,
        crudmethods,
        resetList,
        search,
    ],
    data() {
        return {
            columns1,
            columns2,
            addDisabled: true,
            data1: [],
            cloudData: [],
            activeMenuIndex: 'my-resource',
            selection1: [],
            selection2: [],
            currentTarget: '',
            isGetCloudResource: false,
            modal1: false,
            downloadParam: {},
            resType: '',
            folder: [], // 文件夹
            newFolderFiles: [], // 文件夹下的文件
            myCollectData: [], // 我的收藏
            myUploadData: [], // 我的上传
            setPathParam: {},
            downloadNum: 0,
            uploadNum: 0,
            uploadQueue: [],
            fileFolderId: 'none',
            collectList: [],
            refreshAvalible: true,
            keyword: '',
        };
    },
    computed: {
        ...mapState({
            textbookList: state => state.textbook.textbooks,
            dataList: state => state.app.dataList,
            downloadItems: (state) => {
                const arr = [];
                state.app.downloadItems.forEach((item) => {
                    if (
                        item.status === 'completed'
                        || item.status === 'deleted'
                    ) {
                        arr.push(item);
                    }
                });
                return arr.reverse();
            },
        }),
        ...mapGetters({
            userInfo: 'userInfo',
        }),
    },
    watch: {
        $route(to) {
            console.log(to, 'watchrouter');
            if (
                to.name === 'HomeDetail'
                && this.$route.query.type !== 'headerChange'
            ) {
                this.initData(to);
            }
        },
        dataList() {
            console.log(this.dataList, 'dataList111');
        },
    },
    created() {
        console.log(this.$route, 'created111');
        this.initData(this.$route);
    },
    methods: {
        ...mapMutations(['SET_RES_TYPE_ID', 'openMainSpin', 'setCollectList']),
        ...mapActions(['setResType']),
        formateTimeStamp,
        getSuffix,
        getFileIcon,
        initData(route) {
            const { fileFolderId, resType, chapterId } = route.params;
            console.log(fileFolderId, resType, chapterId, this.current, 'toto');
            this.setResType(resType);
            this.chapterId = chapterId || '';
            this.resType = resType || '';
            this.fileFolderId = fileFolderId;
            this.keyword = route.query.keyword || '';
            if (route.query.level) {
                this.level = route.query.level;
            }
            if (route.query.keyword) {
                this.searchData(route);
            } else if (fileFolderId === 'none') {
                this.getData();
            } else {
                this.getFolderResList(fileFolderId);
            }
        },
        handleFileOrFolderRename(row) {
            // eslint-disable-next-line no-param-reassign
            row.renameStatus = true;
            // console.log(row, 'rowrow');
            if (row.Suffix === 'folder') {
                this.handleFolderRename(row, 'renameFolder');
            } else {
                this.handleFileRename(row);
            }
        },
        handleDeleteFileOrFolder(row) {
            if (row.Suffix === 'folder') {
                this.handleDeleteFolder(row);
            } else {
                this.handleDeleteFile(row);
            }
        },
        getData() {
            this.openMainSpin(true);
            console.log(this.chapterId, 'this.chapterId11');
            this.activeMenuIndex = 'my-resource';
            this.isGetCloudResource = false;
            // this.data1 = [];
            const p = Promise.all([
                new Promise((resolve) => {
                    resolve(this.getFolder(0));
                }),
                new Promise((resolve) => {
                    resolve(
                        this.handleGetResList({
                            type: 2,
                            resType: this.resType,
                            chapterId: this.chapterId,
                            page: 'detail',
                        }),
                    );
                }),
                new Promise((resolve) => {
                    resolve(
                        this.handleGetResList({
                            type: 3,
                            resType: this.resType,
                            chapterId: this.chapterId,
                            page: 'detail',
                        }),
                    );
                }),
            ]);
            p.then((ret) => {
                const arr = [...ret[1], ...ret[2]];
                arr.sort((a, b) => b.AddTime - a.AddTime);
                this.data1 = [...ret[0], ...arr];
                setTimeout(() => {
                    this.refreshAvalible = true;
                    this.openMainSpin(false);
                    this.addEventListener1();
                }, 100);
            }).catch((err) => {
                this.openMainSpin(false);
                console.log(err.toString());
            });
        },
        handleRefresh() {
            console.log(this.$route, 'this.$route111');
            if (this.refreshAvalible) {
                this.refreshAvalible = false;
                this.initData(this.$route);
            }
        },
        handleCloudFile(item) {
            // console.log(this.downloadItems, 'this.downloadItems');
            const result = this.downloadItems.find(
                // 此处不能够比对ResId,如果用户刚上次一个文件，此时要双击查看，此时downloadItem中
                // 只有name,没有resid，所以只能比name。
                // 况且即便有意义也不大，有resid之后，用户一样可以将本地文件改一个相同的文件名，
                // 只适合用在比对，该文件有没有下载过，因为文件名字会变，resid不会变，况且还是存在本地。
                foo => foo.name === item.Name,
            );
            if (result) {
                fs.exists(result.path, (exists) => {
                    if (exists) {
                        shell.openItem(result.path);
                    } else {
                        this.$Message.info('暂时不支持在线预览，请下载后查看');
                    }
                });
            } else {
                this.$Message.info('暂时不支持在线预览，请下载后查看');
            }
        },
        handleOpenFileOrFolder(item) {
            // console.log(item.renameStatus, 'item11');
            if (item.uploading || item.renameStatus) {
                return;
            }
            if (item.Suffix === 'folder') {
                // 请求文件夹下的资源
                this.handleOpenFolder(item);
            } else {
                // console.log(this.downloadItems, 'this.downloadItems');
                const result = this.downloadItems.find(
                    // 此处不能够比对ResId,如果用户刚上次一个文件，此时要双击查看，此时downloadItem中
                    // 只有name,没有resid，所以只能比name。
                    // 况且即便有意义也不大，有resid之后，用户一样可以将本地文件改一个相同的文件名，
                    // 只适合用在比对，该文件有没有下载过，因为文件名字会变，resid不会变，况且还是存在本地。
                    // 后来发现还是要用resid来比对，因为用户可以重命名
                    // foo => foo.name === item.Name,
                    foo => foo.ResId === item.ResId,
                );
                // console.log(result, 'result11');
                if (result) {
                    fs.exists(result.path, (exists) => {
                        if (exists) {
                            shell.openItem(result.path);
                        } else if (item.collect) {
                            this.$Message.info(
                                '暂时不支持在线预览，请下载后查看',
                            );
                        } else {
                            this.$Message.info(
                                '未找到该文件，您可以下载后查看',
                            );
                        }
                    });
                } else if (item.collect) {
                    this.$Message.info('暂时不支持在线预览，请下载后查看');
                } else {
                    this.$Message.info('未找到该文件，您可以下载后查看');
                }
            }
        },
        // 请求文件夹下的资源
        handleOpenFolder(item) {
            console.log(item, 'item333');
            this.level = item.level;
            const routeParam = {
                name: 'HomeDetail',
                params: {
                    chapterId: this.current.chapterId,
                    resType: this.resType,
                    fileFolderId: item.id,
                },
                query: {
                    level: item.level,
                },
            };
            store.commit('changenextWayArr', '');
            const { way } = store.state.app;
            way.push({
                name: item.Name,
                chapterId: this.current.chapterId,
                routeParam: { ...routeParam },
            });
            // console.log(routeParam, 'routeParam11');
            store.commit('changeWay', way);
            this.$router.push(routeParam);
        },
        handleSearch({ value, holderType }) {
            const routeParam = {
                name: 'HomeDetail',
                params: {
                    chapterId:
                        holderType === 'all' ? '' : this.current.chapterId,
                    resType: holderType === 'all' ? '' : this.resType,
                    fileFolderId: holderType === 'all' ? '' : this.fileFolderId,
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
        getFolderResList(fileFolderId) {
            this.openMainSpin(true);
            const p = Promise.all([
                new Promise((resolve) => {
                    resolve(this.getFolder(fileFolderId));
                }),
                new Promise((resolve) => {
                    resolve(
                        this.getResFileFolderResByFileFolderId(fileFolderId),
                    );
                }),
            ]);
            p.then((ret) => {
                // console.log(ret, 'retret');
                const arr = [...ret[1]];
                arr.sort((a, b) => b.AddTime - a.AddTime);
                this.data1 = [...ret[0], ...arr];
                setTimeout(() => {
                    this.refreshAvalible = true;
                    this.openMainSpin(false);
                    this.addEventListener1();
                }, 100);
            }).catch(() => {
                this.openMainSpin(false);
            });
        },
        handleToggle(type) {
            if (this.$refs.selection2) {
                this.$refs.selection2.selectAll(false);
                this.selection2 = [];
            }
            this.activeMenuIndex = type;
            if (type === 'cloud-resource' && !this.isGetCloudResource) {
                this.isGetCloudResource = true;
                this.openMainSpin(true);
                this.handleGetResList({
                    type: 1,
                    resType: this.resType,
                    chapterId: this.chapterId,
                    page: 'detail',
                });
            }
        },
    },
};
</script>

<style lang="less">
.record {
    margin-bottom: 24px;
    margin-top: 88px;
    text-align: center;
}
.keyField {
    color: red;
}
.prompt {
    position: absolute;
    background: red;
    width: 100%;
    height: 100%;
}
.click-disable {
    pointer-events: none;
}
.ivu-table-overflowX {
    overflow-x: hidden;
}
.ivu-poptip-body-content {
    overflow: hidden;
}
.ivu-table-wrapper {
    overflow: visible;
}
.file-name {
    display: inline-block;
    vertical-align: middle;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    position: relative;
    top: 2px;
    line-height: 28px;
    &:hover {
        color: #0279f7;
    }
}
.detail {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    color: #2c3e50;
    .mainBox {
        display: flex;
        background: #f6f7f9;
        // padding: 0 16px;
        flex: 1;
        flex-direction: column;
        position: relative;
        // .name-box {
        //     width: 100%;
        //     height: 100%;
        .click-box {
            max-width: 83%;
            // display: inline-block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: flex;
            cursor: pointer;
            float: left;
            margin-right: 4px;
            .ivu-tooltip {
                width: 100%;
            }
            .file-icon {
                margin-right: 5px;
            }

            .img {
                display: inline-block;
                position: relative;
                top: 4px;
                margin-right: 5px;
                .img-loading {
                    position: absolute;
                    top: 0;
                    left: 0;
                }
            }
        }
        // }
        .title {
            display: flex;
            justify-content: space-between;
            width: 97%;
            margin: 0 auto;
            div {
                text-align: center;
                color: #0279f7;
                border-bottom: 1px solid #0279f7;
                height: 42px;
                line-height: 42px;
                width: 49%;
                background: transparent;
                cursor: pointer;
                button {
                    float: right;
                    margin-top: 9px;
                }
                &:nth-child(2) {
                    border-bottom: 1px solid transparent;
                    background: #fff;
                }
                &.active {
                    background: transparent;
                    border-bottom: 1px solid #0279f7;
                }
            }
            .toLeft {
                margin-right: 8px;
                width: 24px;
                height: 24px;
                vertical-align: middle;
            }
            .toRight {
                margin-left: 8px;
                width: 24px;
                height: 24px;
                vertical-align: middle;
            }
        }
        .resouce-box {
            flex: 1;
            display: flex;
            justify-content: space-between;
            width: 97%;
            margin: auto;
            position: relative;
            margin-top: 16px;
            .file-empty {
                text-align: center;
                // margin-top: 148px;
                position: relative;
                top: 40%;
                transform: translateY(-50%);
                img {
                    width: 180px;
                    height: 180px;
                }
                p:first-child {
                    font-size: 14px;
                    color: rgba(0, 0, 0, 0.4);
                }
                p:nth-child(2) {
                    font-size: 16px;
                    color: rgba(2, 121, 247, 1);
                }
            }
            .my-resource,
            .my-resource-half {
                background: #fff;
                height: 100%;
                overflow-y: scroll;
                .table {
                    border-spacing: 0;
                    width: 100%;
                    tr {
                        height: 48px;
                    }
                }
                .context {
                    ul {
                        list-style: none;
                        li {
                            // width: 86px;
                        }
                    }
                }
                .ivu-poptip-popper {
                    min-width: auto;
                }
                .ivu-poptip-body {
                    padding: 0;
                    width: 58px;
                    text-align: center;
                    color: #626365;
                    .ivu-card-body {
                        li {
                            height: 32px;
                            line-height: 32px;
                            // padding-left: 8px;
                            cursor: pointer;
                            &:hover {
                                background: rgba(0, 0, 0, 0.04);
                            }
                        }
                    }
                }
            }
            .my-resource {
                width: 100%;
            }
            .my-resource-half {
                width: 49%;
            }
            .cloud-resource {
                background: #fff;
                width: 49%;
                height: 100%;
                overflow-y: scroll;
                padding: 0;
            }
            .cloud-resource-dis {
                width: 0;
                height: 0;
                background: #fff;
                overflow: hidden;
            }
            .added {
                float: left;
                margin-top: 4px;
                width: 22px;
                height: 22px;
            }
            .cloud {
                margin-top: 4px;
            }
        }
    }

    #temp {
    }

    .icon-opt {
        display: inline-block;
        width: 22px;
        height: 22px;
        background-size: 22px 22px;
        margin-right: 16px;
    }

    .icon-del {
        cursor: pointer;
        background-image: url("../../assets/images/app/file/delete.png");
        position: relative;
        top: 2px;
    }
    .icon-download {
        cursor: pointer;
        background-image: url("../../assets/images/app/file/download.png");
    }
    .icon-add {
        background-image: url("../../assets/images/app/file/add.png");
    }
    .icon-disable {
        background-image: url("../../assets/images/app/add-disable.png");
    }
    .icon-more {
        background-image: url("../../assets/images/app/file/more.png");
        position: relative;
        top: 2px;
        margin-right: 0;
        cursor: pointer;
    }
}
.ivu-table-cell {
    padding-left: 4px;
    padding-right: 4px;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
