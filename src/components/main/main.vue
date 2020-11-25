<template>
    <div class="root-elem">
        <comHeader />
        <div
            v-if="!isLoading"
            class="root-container"
        >
            <template v-if="textbookList.length">
                <div class="side-menu-wrapper">
                    <comSideMenu />
                </div>
                <div class="content-wrapper">
                    <keep-alive :include="cacheList">
                        <router-view />
                    </keep-alive>
                </div>
            </template>
            <template v-else>
                <select-textbook />
            </template>
        </div>
    </div>
</template>

<script>
import { mapMutations, mapActions, mapState } from 'vuex';
// eslint-disable-next-line import/no-cycle
import api from '@/api/passport';
import comHeader from '@/components/header/index.vue';
import comSideMenu from '@/components/main/side-menu';
// eslint-disable-next-line import/no-cycle
import store from '../../store';
import SelectTextbook from '../selectTextbook';
import db from '../../database';

const { ipcRenderer } = require('electron');

export default {
    components: {
        comHeader,
        comSideMenu,
        SelectTextbook,
    },
    data() {
        return {
            val: 123,
            cacheList: ['HomeDetail', 'HomeIndex', 'upload'],
            isLoading: true,
            isFirstLogin: true,
        };
    },
    created() {
        console.log('main created');
        console.log(this.$route.path + this.$route.query.t, 'dsfsd');
        this.getUserInfo();
        this.listenDownload();
    },
    computed: {
        ...mapState({
            textbookList: state => state.textbook.textbooks,
        }),
    },
    methods: {
        ...mapMutations(['setUserInfo']),
        ...mapActions(['initializeTextbook', 'initAppConfig']),
        // 监听下载事件
        listenDownload() {
            ipcRenderer.on('updateDownload', (event, res) => {
                if (res.status === 'completed') {
                    this.$Message.info(`${res.name}下载完成`);
                }
                if (res.status === 'failed') {
                    setTimeout(() => {
                        this.$Message.info(`${res.name}下载失败`);
                    }, 1000);
                }
                const { downloadItems } = store.state.app;
                downloadItems.forEach((item, index) => {
                    if (item.downloadTimestamp === res.downloadTimestamp) {
                        store.commit('setDownloadItems', {
                            index,
                            item: {
                                ...res,
                            },
                        });
                    }
                });
            });
        },
        getUserInfo() {
            api.getUserInfo().then(({ data }) => {
                this.setUserInfo(data);

                this.initAppConfig(data);
                console.log(data, 'data111');
                this.setCompleteItems(data.uid);
                this.initializeTextbook(data).then(() => {
                    this.isLoading = false;
                });
                console.log('xxx');
            });
        },
        setCompleteItems(uid) {
            db.completeItem.find({ uid }, (err, docs) => {
                console.log(docs, 'docs11');
                store.commit('initDownloadItems', docs);
            });
        },
        getAppConfig(userInfo) {
            const id = userInfo.uid;
            db.appConfig.find({ _id: id }, (err, doc) => {
                if (err) return;
                if (doc.length) {
                    this.userDownloadPath = doc[0].userDownloadPath || '';
                    this.config = {
                        ...doc[0],
                    };
                }
            });
        },
    },
};
</script>

<style lang="less">
.root-elem {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.root-container {
    // height: 100%;
    display: flex;
    flex: 1;

    .side-menu-wrapper {
        height: 100%;
        width: 207px;
        overflow: hidden;
    }

    .content-wrapper {
        flex: 1;
        overflow: hidden;
        position: relative;
    }
}
.app-debug {
    position: fixed;
    right: 0;
    bottom: 20px;
    height: auto;
    z-index: 1000;
    button {
        margin-left: 10px;
    }
}
</style>
