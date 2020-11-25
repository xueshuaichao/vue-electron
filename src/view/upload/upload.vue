<template>
    <div class="upload">
        <!-- <tool-bar /> -->
        <div
            v-if="uploadItems.length > 0"
            class="loading-bar"
        >
            <Icon type="ios-loading" />
            <div>上传总进度</div>
            <Progress :percent="totalProgress" />
            <Button
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
            </Button>
        </div>
        <div class="mainBox">
            <div class="resouce-box">
                <div class="my-resource">
                    <Table
                        v-if="uploadItems.length > 0"
                        :columns="columns1"
                        :data="uploadItems"
                        :show-header="false"
                    >
                        <template
                            slot="process"
                            slot-scope="{ row }"
                        >
                            <Progress :percent="row.progress" />
                            <!-- {{ row.receivedM }}/{{ row.totalM }} -->
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
                                v-if="row.status === 'uploading'"
                                type="primary"
                                icon="md-pause"
                                @click="handlePause(row)"
                            >
                                暂停
                            </Button>
                            <Button
                                v-if="row.status === 'pause'"
                                type="primary"
                                icon="md-play"
                                @click="handleContinue(row)"
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
// import store from '../../store';
import uploadmethods from '../home/uploadmethods';

const fs = require('fs');

export default {
    components: {},
    mixins: [uploadmethods],
    data() {
        return {
            columns1: [
                {
                    title: '文件名称',
                    key: 'name',
                },
                {
                    title: '进度',
                    key: 'process',
                    slot: 'process',
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
            uploadItems: (state) => {
                const arr = [];
                state.app.downloadItems.forEach((item) => {
                    if (
                        item.status !== 'completed'
                        && item.type === 'upload'
                        && item.status !== 'deleted'
                        && item.status !== 'failed'
                    ) {
                        arr.push(item);
                    }
                });
                return arr;
            },
        }),
        allPauseStatus() {
            // 当全部暂停时，就开始，当只有一个时开始时，就全部暂停，
            return this.uploadItems.every(item => item.status === 'pause');
        },
        totalProgress() {
            let allBytes = 0;
            let allRecBytes = 0;
            if (this.uploadItems.length > 0) {
                this.uploadItems.forEach((item) => {
                    if (item.status !== 'pending') {
                        allBytes += parseFloat(item.totalBytes);
                        allRecBytes += parseFloat(item.receivedBytes);
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
        handlePause(row) {
            const obj = {};
            // eslint-disable-next-line no-param-reassign
            row.status = 'pause';
            obj[row.uploadTimestamp] = 'pause';
            this.$store.commit('changeUploadStatus', obj);
        },
        handleContinue(row) {
            console.log(row, 'row11');
            fs.readFile(row.path, (err, data) => {
                if (err) throw err;
                const file = new File([data], row.fileName, {
                    type: row.fileType || '',
                });
                // eslint-disable-next-line no-param-reassign
                row.body = file;
                this.uploadFunction(row, '', (data) => {
                    console.log(data, '123');
                    this.$store.commit('updateData', data);
                });
            });
            // eslint-disable-next-line no-param-reassign
            row.status = 'uploading';
            const obj = {};
            obj[row.uploadTimestamp] = 'uploading';
            this.$store.commit('changeUploadStatus', obj);
        },
        handleCancel(row) {
            if (row.status === 'uploading') {
                const obj = {};
                obj[row.uploadTimestamp] = 'failed';
                this.$store.commit('changeUploadStatus', obj);
            } else {
                this.updateUploadStatus({
                    ...row,
                    status: 'failed',
                });
            }
            this.completeUploadStatus(
                {
                    ...row,
                    status: 'failed',
                },
                '',
            );
            // eslint-disable-next-line no-param-reassign
            row.status = 'failed';
        },
        handleAllPause() {
            this.uploadItems.forEach((item) => {
                if (item.status === 'uploading') {
                    this.handlePause(item);
                }
            });
        },
        handleAllStart() {
            this.uploadItems.forEach((item) => {
                if (item.status === 'pause') {
                    this.handleContinue(item);
                }
            });
        },
        handleAllCancel() {
            this.$Modal.confirm({
                title: '删除提示',
                content: '<p>是否确认全部取消下载任务？</p>',
                onOk: () => {
                    this.uploadItems.forEach((item) => {
                        // if (item.status === 'pause') {
                        this.handleCancel(item);
                        // }
                    });
                },
            });
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

.upload {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    color: #2c3e50;
    overflow-y: scroll;
    .ivu-table-overflowX {
        overflow-x: hidden;
    }
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
