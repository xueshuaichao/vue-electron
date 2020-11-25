<template>
    <Modal
        v-model="show"
        title="设置"
        class="app-modal app-setting"
        footer-hide
        width="480"
    >
        <Layout>
            <Sider
                ref="side1"
                v-model="isCollapsed"
                hide-trigger
                collapsible
                width="120"
            >
                <Menu
                    :active-name="activeName"
                    width="auto"
                    @on-select="handleSelect"
                >
                    <MenuItem name="general">
                        <span>通用设置</span>
                    </MenuItem>
                    <MenuItem name="download">
                        <span>下载设置</span>
                    </MenuItem>
                    <MenuItem name="update">
                        <span>软件更新</span>
                    </MenuItem>
                </Menu>
            </Sider>
            <Layout class="app-settiong-content">
                <div
                    v-if="activeName === 'general'"
                    class="general-setting"
                >
                    <div class="item flex-row">
                        <p>开机时自动启动</p>
                        <div
                            class="radio"
                            :class="
                                userAppConfig.isAutoStart
                                    ? 'radio'
                                    : 'radio-off'
                            "
                            @click="handleChangeRadio('isAutoStart')"
                        />
                    </div>
                    <div class="item flex-row">
                        <p>有更新时自动升级</p>
                        <div
                            class="radio"
                            :class="
                                userAppConfig.isAutoUpgrade
                                    ? 'radio'
                                    : 'radio-off'
                            "
                            @click="handleChangeRadio('isAutoUpgrade')"
                        />
                    </div>
                </div>
                <div
                    v-if="activeName === 'download'"
                    class="download-setting"
                >
                    <p class="label">
                        下载文件时位置选择
                    </p>
                    <div class="path flex-row">
                        <p>{{ config.userDownloadPath }}</p>
                        <i-button
                            type="primary"
                            :disabled="!userAppConfig.isDownloadPath"
                            @click="openDialog"
                        >
                            选择
                        </i-button>
                    </div>
                    <Checkbox
                        v-model="userAppConfig.isDownloadPath"
                        @on-change="handleChange"
                    >
                        默认此路径为下载路径
                    </Checkbox>
                </div>
                <div
                    v-if="activeName === 'update'"
                    class="update-setting"
                >
                    <img
                        src="../../assets/images/app/update.png"
                        alt=""
                        style="width: 120px"
                    >
                    <p />
                    <i-button type="primary">
                        检测版本
                    </i-button>
                    <p>当前版本：V1.0.0</p>
                    <p>
                        Copyright©2019 伟东云教育版权所有
                    </p>
                </div>
                <div
                    v-show="activeName !== 'update'"
                    class="button-wrapper"
                >
                    <i-button
                        type="primary"
                        @click="handleClickOk"
                    >
                        确定
                    </i-button>
                    <i-button @click="handleHide">
                        取消
                    </i-button>
                </div>
            </Layout>
        </Layout>
    </Modal>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import './index.less';

export default {
    name: 'Setting',
    data() {
        return {
            show: false,
            isCollapsed: false,
            activeName: 'general',
            config: {
                userDownloadPath: this.$remote.app.getPath('downloads'),
            },
        };
    },
    created() {
        console.log(this.$remote.app.getPath('downloads'), 'downloads111');
    },
    computed: {
        ...mapGetters(['userInfo', 'userAppConfig']),
    },
    methods: {
        ...mapActions(['updateUserAppConfigOfDb', 'setUserDownloadPath']),
        openDialog() {
            const [path] = this.$remote.dialog.showOpenDialog(this.$current, {
                title: '下载地址',
                properties: ['openDirectory'],
            }) || [];

            if (path) {
                this.config.userDownloadPath = path;
            }
        },
        handleShow() {
            this.show = true;
            if (this.userAppConfig.userDownloadPath) {
                this.config.userDownloadPath = this.userAppConfig.userDownloadPath;
            }
        },
        handleChangeRadio(key) {
            this.userAppConfig[key] = !this.userAppConfig[key];
            if (key === 'isAutoStart') {
                this.$ipcRenderer.send(
                    'app-auto-start',
                    this.userAppConfig[key],
                );
            }
        },
        handleSelect(val) {
            this.activeName = val;
        },
        handleChange(val) {
            if (!val) {
                this.updateUserAppConfigOfDb({
                    isDownloadPath: this.userAppConfig.isDownloadPath,
                });
            }
        },
        handleClickOk() {
            const {
                isDownloadPath,
                isAutoStart,
                isAutoUpgrade,
            } = this.userAppConfig;
            console.log(this.config, 'config');
            if (isDownloadPath && this.activeName === 'download') {
                this.setUserDownloadPath(this.config);
            } else if (this.activeName === 'general') {
                this.updateUserAppConfigOfDb({ isAutoStart, isAutoUpgrade });
            }
            this.handleHide();
        },
        handleHide() {
            this.show = false;
        },
    },
};
</script>
>
