<template>
    <Modal
        v-model="show"
        title="设置下载存储路径"
        @on-cancel="cancel"
    >
        <div style="position:relative;height:136px">
            <img
                style="position: absolute;
                    left:20px;"
                src="../../assets/images/app/png.png"
            >
            <div class="name">
                {{ setPathParam.name }}
            </div>
            <!-- <div
                style="position: absolute;
            top:20px;
            left:64px;"
            >
                文件大小：{{ setPathParam.size }}
            </div> -->
            <div
                style="position: absolute;
            top:56px;
            left:14px;"
            >
                下载到
            </div>
            <div class="path-one">
                {{ pathValue }}
            </div>
            <Button
                style="position: absolute;
            top:47px;
            left:314px;"
                type="primary"
                @click="handleScan"
            >
                浏览
            </Button>
            <!-- <div
                style="position: absolute;
            top:100px;
            left:64px;"
            >
                E盘剩余空间：181.85GB
            </div> -->
            <Checkbox
                v-model="userAppConfig.isDownloadPath"
                style="position: absolute;
            top:103px;
            left:64px;"
            >
                默认此路径为下载路径
            </Checkbox>
        </div>
        <div slot="footer">
            <Button @click="cancel">
                取消
            </Button>
            <Button
                type="primary"
                @click="ok"
            >
                确定
            </Button>
        </div>
    </Modal>
</template>

<script>
import { mapGetters } from 'vuex';

const { dialog } = require('electron').remote;

export default {
    props: {
        modal1: {
            type: Boolean,
            default() {
                return false;
            },
        },
        path: {
            type: String,
            default() {
                return '';
            },
        },
        setPathParam: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    computed: {
        ...mapGetters(['userAppConfig']),
    },
    data() {
        return {
            show: false,
            pathValue: this.path,
        };
    },
    watch: {
        path() {
            this.pathValue = this.path;
        },
        modal1(val) {
            this.show = val;
        },
    },
    created() {},
    methods: {
        cancel() {
            console.log('点击插好');
            this.$emit('cancel');
        },
        handleScan() {
            dialog.showOpenDialog(
                {
                    // 默认路径
                    defaultPath: 'C:/Users/wd/Desktop',
                    // 选择操作，此处是打开文件夹
                    properties: ['openDirectory'],
                    // 过滤条件
                    filters: [{ name: 'All', extensions: ['*'] }],
                },
                (res) => {
                    // 回调函数内容，此处是将路径内容显示在input框内
                    console.log(res, 'res34');
                    if (res) {
                        [this.pathValue] = res;
                    }
                },
            );
        },
        ok() {
            console.log(this.userAppConfig, '555');
            // 渲染器进程代码
            const obj = {
                userDownloadPath: this.pathValue,
            };
            // console.log(obj);
            this.$store.dispatch('setUserDownloadPath', obj);
            this.$emit('ok');
            this.show = false;
        },
    },
};
</script>

<style>
.path-one {
    position: absolute;
    top: 46px;
    left: 64px;
    width: 50%;
    border: 1px solid #ececec;
    height: 32px;
    line-height: 32px;
    border-radius: 5px;
    padding-left: 5px;
    text-overflow: ellipsis;
    overflow: hidden;
}
.name {
    position: absolute;
    left: 64px;
    top: 3px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    width: 300px;
}
</style>
