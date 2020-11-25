<template>
    <div class="upload">
        <!-- <tool-bar /> -->
        <div
            v-if="downloadItems.length > 0"
            class="loading-bar"
        >
            <Icon type="ios-loading" />
            <div>下载总进度</div>
            <Progress :percent="totalProgress" />
            <!-- <Button
                v-if="!allPauseStatus"
                type="primary"
                icon="md-pause"
                @click="handleAllPause"
            >
                全部暂停
            </Button>
            <Button
                v-if="allPauseStatus"
                type="primary"
                icon="md-play"
                @click="handleAllStart"
            >
                全部开始
            </Button>
            <Button
                style="margin-left:20px"
                type="primary"
                icon="md-close"
                @click="handleAllCancel"
            >
                全部取消
            </Button> -->
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
                            slot="progress"
                            slot-scope="{ row }"
                        >
                            <Progress :percent="row.progress" />
                        </template>
                        <template
                            slot="num"
                            slot-scope="{ row }"
                        >
                            {{ row.receivedM || 0 }}/{{ row.totalM || 0 }}
                        </template>
                        <template
                            slot="action"
                            slot-scope="{ row }"
                        >
                            <Button
                                v-if="row.status === 'downloading'"
                                type="primary"
                                icon="md-pause"
                                @click="handlePause(row.downloadTimestamp)"
                            >
                                暂停
                            </Button>
                            <Button
                                v-if="row.status === 'pause'"
                                type="primary"
                                icon="md-play"
                                @click="handleContinue(row.downloadTimestamp)"
                            >
                                开始
                            </Button>
                            <Button
                                v-if="row.status !== 'pending'"
                                style="margin-left:20px"
                                type="primary"
                                icon="md-close"
                                @click="handleCancel(row)"
                            >
                                取消
                            </Button>
                            <span v-if="row.status === 'pending'">
                                等待中
                            </span>
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
import { mapState } from 'vuex';

const { ipcRenderer } = require('electron');

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
                    title: '进度',
                    key: 'progress',
                    slot: 'progress',
                    width: 200,
                },
                {
                    title: '下载体积',
                    key: 'num',
                    slot: 'num',
                    width: 150,
                },
                {
                    title: '操作',
                    key: 'action',
                    slot: 'action',
                    align: 'left',
                    width: 300,
                },
            ],
        };
    },
    computed: {
        ...mapState({
            downloadItems: (state) => {
                const arr = [];
                state.app.downloadItems.forEach((item) => {
                    if (
                        item.status !== 'completed'
                        && item.status !== 'canceled'
                        && item.type === 'download'
                        && item.status !== 'failed'
                        && item.status !== 'deleted'
                    ) {
                        arr.push(item);
                    }
                });
                return arr;
            },
        }),
        allPauseStatus() {
            // 当全部暂停时，就开始，当只有一个时开始时，就全部暂停，
            return this.downloadItems.every(item => item.status === 'pause');
        },
        totalProgress() {
            let allBytes = 0;
            let allRecBytes = 0;
            if (this.downloadItems.length > 0) {
                this.downloadItems.forEach((item) => {
                    if (item.status !== 'pending' && item.totalBytes) {
                        allBytes += item.totalBytes || 0;
                        allRecBytes += item.receivedBytes || 0;
                    }
                });
            }
            return allRecBytes === 0
                ? 0
                : parseFloat(((allRecBytes / allBytes) * 100).toFixed(2));
        },
    },
    created() {},
    methods: {
        handlePause(downloadTimestamp) {
            ipcRenderer.send('pause', downloadTimestamp);
        },
        handleContinue(downloadTimestamp) {
            ipcRenderer.send('continue', downloadTimestamp);
        },
        handleCancel(item) {
            ipcRenderer.send('cancel', item.downloadTimestamp);
        },
        // handleAllPause() {
        //     this.downloadItems.forEach((item, index) => {
        //         if (item.status === 'downloading') {
        //             ipcRenderer.send('pause', item.downloadTimestamp);
        //         }
        //     });
        // },
        // handleAllStart() {
        //     this.downloadItems.forEach((item, index) => {
        //         if (item.status === 'pause') {
        //             setTimeout(() => {
        //                 ipcRenderer.send('continue', item.downloadTimestamp);
        //             }, 50 * index);
        //         }
        //     });
        // },
        // allCancelFunction() {
        //     this.downloadItems.forEach((item, index) => {
        //         // setTimeout(() => {
        //         ipcRenderer.send('cancel', item.downloadTimestamp);
        //         // }, 50 * index);
        //         // if (item.status === 'pending') {
        //         //     this.abc(item.downloadTimestamp);
        //         // }
        //     });
        // },
        // handleAllCancel() {
        //     this.$Modal.confirm({
        //         title: '删除提示',
        //         content: '<p>是否确认全部取消下载任务？</p>',
        //         onOk: () => {
        //             this.allCancelFunction();
        //         },
        //     });
        // },
    },
};
</script>

<style lang="less" scoped>
.ivu-poptip-inner {
    width: 66px;
}
.ivu-poptip-body-content {
    overflow: hidden;
}
.ivu-table-wrapper {
    overflow: visible;
}
.download-fail {
    color: #cb3a3a;
    font-size: 12px;
}
.upload {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    color: #2c3e50;
    overflow-y: scroll;
    .loading-bar {
        display: flex;
        align-items: center;
        height: 48px;
        padding-left: 24px;
        padding-right: 37px;
        & > div {
            margin-right: 17px;
            margin-left: 17px;
            white-space: nowrap;
        }
    }
    .mainBox {
        display: flex;
        background: #f6f7f9;
        padding: 16px;
        flex: 1;
        flex-direction: column;
        .resouce-box {
            flex: 1;
            display: flex;
            .my-resource {
                // flex:1;
                background: #fff;
                width: 100%;
                height: 100%;
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
