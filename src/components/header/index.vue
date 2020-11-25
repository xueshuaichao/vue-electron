<template>
    <div class="comp-header">
        <div class="header-logo" />
        <div class="navigation">
            <div
                class="navigation-item"
                :class="{ active: active === 'page-home' }"
                @click="gotoResourcePage"
            >
                <img src="../../assets/images/app/resourcecentre_light.png">
                资源中心
            </div>
            <!-- <div class="navigation-item">
                <img src="../../assets/images/app/apply.png">
                应用中心
            </div> -->
            <div @click="handleRefresh">
                <!-- 刷新 -->
            </div>
            <div @click="handleConsol">
                控制台
            </div>
        </div>
        <div class="info flex-row">
            <div
                class="download"
                :class="{ active: active === 'page-upload' }"
                @click="handleChange(activeName)"
            >
                <span
                    v-if="uploadNum || downloadNum"
                    class="upload-num"
                >{{
                    uploadNum + downloadNum
                }}</span>
                <img
                    src="../../assets/images/header/download@2x.png"
                    alt=""
                >
            </div>
            <Dropdown
                class="user"
                @on-click="handleClick"
            >
                <a
                    v-if="userInfo.real_name"
                    href="javascript:void(0)"
                    style="color: white;"
                >
                    <img
                        v-if="!userInfo.avatarurl"
                        src="../../assets/images/header/photo2x.png"
                        alt=""
                    >
                    <img
                        v-else
                        :src="userInfo.avatarurl"
                        alt=""
                    >
                    {{ real_name }}
                </a>
                <DropdownMenu slot="list">
                    <DropdownItem name="user">
                        基本信息
                    </DropdownItem>
                    <!-- <DropdownItem>意见反馈</DropdownItem> -->
                    <DropdownItem name="loginOut">
                        退出
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div>
        <div class="app-control flex-row">
            <div
                class="control-item"
                @click="$refs.setting.handleShow()"
            >
                <img
                    src="../../assets/images/header/set@2x.png"
                    alt=""
                >
            </div>
            <div
                class="control-item"
                @click="$current.minimize()"
            >
                <img
                    src="../../assets/images/header/mini@2x.png"
                    alt=""
                >
            </div>
            <div
                class="control-item"
                @click="handleClickMax"
            >
                <img
                    src="../../assets/images/header/max@2x.png"
                    alt=""
                >
            </div>
            <div
                class="control-item"
                @click="$ipcRenderer.send('win-close')"
            >
                <img
                    src="../../assets/images/header/cancel@2x.png"
                    alt=""
                >
            </div>
        </div>
        <setting ref="setting" />
    </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import setting from '@/components/setting/index.vue';
// import store from '../../store';

export default {
    components: {
        setting,
    },
    props: {
        active: {
            type: String,
            default: 'page-home',
        },
    },
    data() {
        console.log('init  ....');
        return {
            currentPage: '',
            isMax: true,
        };
    },
    computed: {
        ...mapGetters(['userInfo', 'uploadNum', 'downloadNum', 'completeNum']),
        ...mapState({
            resTypeId: state => state.textbook.resTypeId,
        }),
        activeName() {
            let activeName = 'upload';
            if (this.uploadNum > 0) {
                activeName = 'upload';
            } else if (this.downloadNum > 0) {
                activeName = 'download';
            } else if (this.completeNum > 0) {
                activeName = 'complete';
            }
            console.log(activeName, 'activeName');
            return activeName;
        },
        real_name() {
            let name = this.userInfo.real_name;
            if (name.length > 3) {
                name = `${name.slice(0, 3)}...`;
            }
            return name;
        },
    },
    mounted() {},
    methods: {
        ...mapActions(['goTo', 'loginOut']),
        handleConsol() {
            this.$ipcRenderer.send('create-console');
        },
        handleRefresh() {
            window.location.reload();
        },
        handleChange(name) {
            console.log('replace');
            this.$router.push({
                name,
            });
        },
        gotoResourcePage() {
            const { way } = this.$store.state.app;
            const currentroute = way[way.length - 1].routeParam.name;
            if (currentroute === 'HomeIndex') {
                this.$router.push({
                    name: 'HomeIndex',
                });
            } else {
                this.$router.push({
                    name: 'HomeDetail',
                    params: {
                        ...way[way.length - 1].routeParam.params,
                    },
                    query: {
                        type: 'headerChange',
                    },
                });
            }
        },
        handleClick(name) {
            switch (name) {
                case 'user':
                    this.handleSetCookie();
                    break;
                case 'loginOut':
                    this.handleLoginOut();
                    break;
                default:
                    break;
            }
        },
        handleSetCookie() {
            const { appid, token, location } = this.userInfo;
            const params = new URLSearchParams({
                'WD-TOKEN': token,
                'WD-LOCAION': location,
                'WD-AUTH': appid,
            });
            const url = `http://myspace.qdeduyun.cn/index.html#/userContent/baseInformation?${params.toString()}`;
            this.$shell.openExternal(url);
        },
        handleLoginOut() {
            const content = this.uploadNum
                ? '有文件正在传输，退出后任务无法进行，确认退出？'
                : '是否确认退出';
            this.$Modal.confirm({
                title: '退出',
                content,
                onOk: () => {
                    this.handleClearCookie();
                },
            });
        },
        handleClickMax() {
            if (this.isMax) {
                this.$current.maximize();
                this.isMax = false;
            } else {
                this.isMax = true;
                this.$current.setResizable(true);
                this.$current.setSize(1200, 600);
                this.$current.center();
                this.$current.setResizable(false);
            }
        },
        handleClearCookie() {
            this.loginOut().then(() => {});
            setTimeout(() => {
                this.$current.close();
            }, 600);
        },
    },
};
</script>

<style lang="less">
.comp-header {
    height: 64px;
    background: #0279f7;
    line-height: 64px;
    display: flex;
    -webkit-app-region: drag;
    -webkit-user-select: none;
    .header-logo {
        background: url("../../assets/images/app/header-logo.png");
        background-size: 100% 100%;
        width: 133px;
        height: 40px;
        flex-shrink: 0;
        margin: 12px 146px 12px 16px;
    }

    .navigation {
        display: flex;
        -webkit-app-region: no-drag;
    }

    .navigation-item {
        width: 144px;
        height: 100%;
        font-size: 14px;
        line-height: 64px;
        text-align: center;
        color: white;
        cursor: pointer;
        img {
            width: 32px;
            height: 32px;
            vertical-align: middle;
        }
        &:hover {
            background: rgba(0, 0, 0, 0.2);
        }
        &.active {
            background: rgba(0, 0, 0, 0.2);
        }
    }

    .info {
        margin-left: auto;
        -webkit-app-region: no-drag;
        img {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            vertical-align: middle;
        }
    }
    .user {
        flex-shrink: 0;
        font-size: 14px;
        color: white;
        width: 100px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        img {
            margin-right: 8px;
        }
        .user-name {
            display: block;
            width: 100%;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }
    }
    .download {
        cursor: pointer;
        position: relative;
        height: 100%;
        text-align: center;
        padding: 0 30px;
        margin-right: 10px;
        &.active {
            background: rgba(0, 0, 0, 0.2);
        }
        .upload-num {
            width: 22px;
            height: 22px;
            background: #db5858;
            text-align: center;
            line-height: 22px;
            position: absolute;
            top: 11px;
            left: 53px;
            border-radius: 11px;
            color: #fff;
        }
    }
    .app-control {
        padding-right: 24px;
        -webkit-app-region: no-drag;
        img {
            width: 16px;
        }
    }
    .control-item {
        display: flex;
        flex-flow: row;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        &:hover {
            background: rgba(0, 0, 0, 0.2);
        }
    }
}
</style>
