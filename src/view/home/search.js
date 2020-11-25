// import { mapGetters } from 'vuex';
import api from '@/api/passport';

// import store from '../../store';

// import db from '../../database';

// const { ipcRenderer } = require('electron');
// const path = require('path');

export default {
    data() {
        return {};
    },
    computed: {},
    mounted() {},
    methods: {
        searchData(route) {
            // chapterId;resType;fileFolderId;keyword;
            this.openMainSpin(true);
            console.log(this.chapterId, 'this.chapterId11');
            this.activeMenuIndex = 'my-resource';
            this.isGetCloudResource = false;
            // this.data1 = [];
            const p = Promise.all([
                new Promise((resolve) => {
                    resolve(
                        this.handleSearchResList({
                            type: 2,
                            resType: route.params.resType || '',
                            chapterId: route.params.chapterId || '',
                            fileFolderId: route.params.fileFolderId || '',
                            keyword: route.query.keyword,
                        }),
                    );
                }),
                new Promise((resolve) => {
                    resolve(
                        this.handleSearchResList({
                            type: 3,
                            resType: route.params.resType || '',
                            chapterId: route.params.chapterId || '',
                            fileFolderId: route.params.fileFolderId || '',
                            keyword: route.query.keyword,
                        }),
                    );
                }),
            ]);
            p.then((ret) => {
                const arr = [...ret[0], ...ret[1]];
                arr.sort((a, b) => b.AddTime - a.AddTime);
                this.data1 = [...arr];
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
        handleSearchResList(
            {
                type, resType, chapterId, fileFolderId, keyword,
            },
            callback,
        ) {
            // console.log(this.$route);
            const params = {
                wdSiteId: this.current.wdSiteId, // 伟东学校/机构id 1100001000000093541
                wdStageId: this.current.wdStageId, // 学段
                wdSubjectId: this.current.wdSubjectId, // 学科
                versionId: this.current.versionId, // 版本 id
                fasId: this.current.fasId, // 分册 id
                chapBranId: chapterId, // 章节
                resType, // 资源类型（必填项
                type, // 类型 1 云端-2 我上传的-3 我收藏的（必填项
                wdUserId: type === 1 ? '' : this.userInfo.loginid, // 当 type 为 2 或 3 时必传
                sort: 'AddTime_desc', // {字段}_{顺序} 如：AddTime_desc，默认值AddTime_desc
                limit: 100,
                chapRelation: 0,
                keyword,
                fileFolderId: fileFolderId === 'none' ? '' : fileFolderId,
            };
            // console.log(params, 'paaaaaa');
            return api
                .searchResList(params)
                .then(({ data }) => {
                    const result = [];
                    if (type === 2) {
                        // 我上传的
                        this.myUploadData = data.data.filter((item) => {
                            if (item.CheckStatus !== 5) {
                                return item;
                            }
                            return false;
                        });
                        return this.myUploadData;
                    }
                    if (type === 3) {
                        // 我收藏的
                        this.collectList = [];
                        this.myCollectData = data.data.map((item) => {
                            // eslint-disable-next-line no-param-reassign
                            item.collect = true;
                            this.collectList.push(item.ResId);
                            return item;
                        });
                        this.setCollectList(this.collectList);
                        // eslint-disable-next-line no-unused-expressions
                        callback && callback();
                        return this.myCollectData;
                    }
                    if (type === 1) {
                        // 云端的
                        this.cloudData = data.data;
                        setTimeout(() => {
                            this.openMainSpin(false);
                            this.addEventListener2();
                        }, 100);
                        return this.cloudData;
                    }
                    return result;
                })
                .catch(() => {
                    this.openMainSpin(false);
                });
        },
    },
};
