/* eslint-disable no-restricted-syntax */
<template>
    <div class="upload">
        <!-- <tool-bar /> -->
        <div
            v-if="downloadItems.length > 0"
            class="loading-bar"
        >
            <div>
                <Icon
                    type="ios-checkmark-circle"
                    size="20"
                    color="#0279F7"
                />共传输完<span>{{ downloadItems.length }}</span>个文件!
            </div>
            <Button
                type="primary"
                icon="ios-trash"
                @click="handleClear"
            >
                清空记录
            </Button>
        </div>
        <div class="mainBox">
            <div class="resouce-box">
                <div class="my-resource">
                    <Table
                        v-if="downloadItems.length > 0"
                        :columns="columns1"
                        :data="downloadItems"
                        :show-header="false"
                    >
                        <template
                            slot="status"
                            slot-scope="{ row }"
                        >
                            <span class="name">
                                {{ row.name }}
                            </span>
                        </template>
                        <template
                            slot="status"
                            slot-scope="{ row }"
                        >
                            <span
                                :style="{
                                    color:
                                        row.status === 'completed'
                                            ? '#000'
                                            : '#CB3A3A'
                                }"
                            >
                                {{ getdownload_text(row) }}
                            </span>
                        </template>
                        <template
                            slot="openFile"
                            slot-scope="{ row }"
                        >
                            <div
                                class="point"
                                @click="handleOpenFile(row)"
                            >
                                <Icon
                                    type="ios-document"
                                    size="20"
                                    color="#0279F7"
                                />打开文件
                            </div>
                        </template>
                        <template
                            slot="openFolder"
                            slot-scope="{ row }"
                        >
                            <div
                                v-if="
                                    !(
                                        row.type === 'upload' &&
                                        row.status === 'failed'
                                    )
                                "
                                class="point"
                                @click="handleOpenFolder(row)"
                            >
                                <Icon
                                    type="md-folder"
                                    size="20"
                                    color="#ffd23d"
                                />打开所在文件夹
                            </div>
                        </template>
                    </Table>
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
    </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import db from '../../database';
import store from '../../store';

const fs = require('fs');

const { appConfig } = db;
const { shell } = require('electron');

export default {
    components: {},
    data() {
        return {
            columns1: [
                {
                    title: '文件名称',
                    key: 'name',
                },
                {
                    title: '完成时间',
                    key: 'time',
                    width: 140,
                },
                {
                    title: '状态',
                    key: 'status',
                    slot: 'status',
                    width: 90,
                },
                {
                    title: '大小',
                    key: 'totalM',
                    width: 90,
                },
                {
                    title: '打开文件',
                    key: 'openFile',
                    slot: 'openFile',
                    width: 100,
                },
                {
                    title: '打开文件夹',
                    key: 'openFolder',
                    slot: 'openFolder',
                    width: 140,
                    align: 'left',
                },
            ],
            downloadFolder: '',
        };
    },
    computed: {
        ...mapState({
            downloadItems: (state) => {
                const arr = [];
                state.app.downloadItems.forEach((item) => {
                    if (
                        item.status === 'completed'
                        || item.status === 'failed'
                    ) {
                        arr.push(item);
                    }
                });
                return arr.reverse();
            },
        }),
        ...mapGetters(['userInfo', 'current']),
    },
    created() {
        this.getAppConfig();
    },
    methods: {
        handleClear() {
            this.$Modal.confirm({
                title: '删除提示',
                content: '<p>清空后数据将无法恢复，是否确认清空？</p>',
                onOk: () => {
                    db.completeItem.update(
                        {
                            $or: [
                                {
                                    uid: this.$store.state.textbook.uid,
                                    status: 'completed',
                                },
                                {
                                    uid: this.$store.state.textbook.uid,
                                    status: 'failed',
                                },
                            ],
                        },
                        { $set: { status: 'deleted' } },
                        { multi: true },
                        (err, numReplaced) => {
                            console.log(err);
                            console.log(numReplaced);
                            const { downloadItems } = store.state.app;
                            const result = downloadItems.map((item) => {
                                if (
                                    item.status === 'completed'
                                    || item.status === 'failed'
                                ) {
                                    return { ...item, status: 'deleted' };
                                }
                                return { ...item };
                            });
                            store.commit('initDownloadItems', result);
                        },
                    );
                },
            });
        },
        getdownload_text(row) {
            let result = '';
            if (row.type === 'download') {
                result = row.status === 'completed' ? '下载完成' : '下载失败';
            } else {
                result = row.status === 'completed' ? '上传完成' : '上传失败';
            }
            return result;
        },
        getAppConfig() {
            const id = this.userInfo.uid;
            this.uid = id;
            appConfig.find({ _id: id }, (err, doc) => {
                if (err) return;
                console.log(doc, 'doc');
                if (doc.length) {
                    this.downloadFolder = doc[0].userDownloadPath || '';
                }
            });
        },
        handleMore() {
            this.$router.push();
        },
        handleOpenFile(row) {
            console.log(row, 'name');
            fs.exists(row.path, (exists) => {
                if (exists) {
                    shell.openItem(row.path);
                } else {
                    this.$Message.info('未找到文件');
                }
            });
        },
        deepCopy(o) {
            if (o instanceof Array) {
                const n = [];
                for (let i = 0; i < o.length; i += 1) {
                    n[i] = this.deepCopy(o[i]);
                }
                return n;
            }
            if (o instanceof Object) {
                const n = {};
                // for (const i in o) {
                //     n[i] = this.deepCopy(o[i]);
                // }
                Object.keys(o).forEach((key) => {
                    n[key] = this.deepCopy(o[key]);
                });
                return n;
            }
            return o;
        },
        handleOpenFolder(row) {
            console.log(row, 'name');
            if (row.type === 'upload') {
                const rowWay = this.deepCopy(row.way);
                store.commit('changenextWayArr', '');
                store.commit('changeWay', rowWay);
                this.$store.dispatch(
                    'selectChapter',
                    rowWay[rowWay.length - 1].chapterId,
                );
                this.$router.push(rowWay[rowWay.length - 1].routeParam);
            } else {
                fs.exists(row.path, (exists) => {
                    if (exists) {
                        shell.showItemInFolder(row.path);
                    } else {
                        this.$Message.info('未找到文件夹');
                    }
                });
            }
        },
    },
};
</script>

<style lang="less">
.ivu-poptip-inner {
    width: 66px;
}
.ivu-poptip-body-content {
    overflow: hidden;
}
.ivu-table-wrapper {
    overflow: visible;
}
.point {
    cursor: pointer;
}
.ivu-table-cell {
    white-space: nowrap;
}

.upload {
    .ivu-table-overflowX {
        overflow-x: hidden;
    }
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    color: #2c3e50;
    // &::-webkit-scrollbar {
    //     width: 8px;
    // }
    // &::-webkit-scrollbar-thumb{
    //     border-radius: 4px;
    //     background-color: rgba(0,0,0,0.1);
    // }
    .loading-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 48px;
        padding-left: 24px;
        padding-right: 37px;
    }
    .mainBox {
        display: flex;
        background: #f6f7f9;
        padding: 16px;
        flex: 1;
        flex-direction: column;
        overflow-y: scroll;
        .resouce-box {
            flex: 1;
            display: flex;
            .my-resource {
                // flex:1;
                background: #fff;
                width: 100%;
                height: 100%;
                .name {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .context {
                    ul {
                        list-style: none;
                        li {
                            width: 86px;
                        }
                    }
                    .ivu-poptip-body {
                        padding: 0;
                    }
                }
                .file-empty {
                    text-align: center;
                    margin-top: 148px;
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
            }
        }
    }
}
</style>
