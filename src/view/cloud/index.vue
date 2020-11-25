<template>
    <Modal
        v-model="show"
        title="云资源"
        width="1100"
        height="600"
        footer-hide
        class="app-modal cloud-wrapper"
    >
        <div class="cloud-resource">
            <Layout>
                <Sider
                    hide-trigger
                    :width="width"
                    class="cloud-sider"
                >
                    <cloudSider
                        :selected="selected"
                        :font="20"
                        @on-select-end="handleParams"
                    />
                </Sider>
                <Layout>
                    <div class="cloud-content">
                        <cloudSearch
                            :selected="selected"
                            @on-success="handleParams"
                        />
                        <template v-if="resourcesList.length">
                            <div class="content-wrapper">
                                <resource :resources-list="resourcesList" />
                            </div>
                            <Page
                                :total="total"
                                :page-size="params.limit"
                                :page-size-opts="pageSizeOpts"
                                show-sizer
                                show-total
                                :current="begin"
                                @on-change="getResourcesList"
                                @on-page-size-change="handleChangePageSize"
                            />
                        </template>
                        <template v-else>
                            <div class="none">
                                <Spin
                                    v-if="isLoading"
                                    fix
                                >
                                    <Icon
                                        type="ios-loading"
                                        size="24"
                                        class="demo-spin-icon-load"
                                    />
                                    <div>正在加载...</div>
                                </Spin>
                                <template v-else>
                                    <img
                                        src="../../assets/images/app/file-empty.png"
                                        alt=""
                                    >
                                    <p>未找到资源换个关键词试试！</p>
                                </template>
                            </div>
                        </template>
                    </div>
                </Layout>
            </Layout>
        </div>
    </Modal>
</template>

<script>
/* eslint-disable no-param-reassign */
import { mapGetters } from 'vuex';
import api from '@/api/resources';
import cloudSider from './components/sider/index.vue';
import cloudSearch from './components/search/index.vue';
import resource from './components/resource/index.vue';
import './index.less';

export default {
    name: 'Cloud',
    components: {
        cloudSider,
        cloudSearch,
        resource,
    },
    props: {
        width: {
            type: String,
            default: '260',
        },
    },
    data() {
        return {
            showPath: false,
            show: false,
            resourcesList: [],
            selected: {},
            params: {
                type: 1,
                wdSiteId: '',
                wdStageId: '',
                wdSubjectId: '',
                versionId: '',
                fasId: '',
                resType: '',
                keyword: '',
                limit: 5,
                begin: 0,
            },
            pageSizeOpts: [5, 10, 20],
            total: 0,
            begin: 1,
            isLoading: true,
        };
    },
    computed: {
        ...mapGetters([
            'userInfo',
            'current',
            'filtersList',
            'collectList',
            'curTextbook',
        ]),
    },
    methods: {
        getResourcesList(num = 1) {
            this.params.begin = num - 1;
            this.begin = num;
            api.getResourcesList({ ...this.params }).then(
                ({ data: { data, num } }) => {
                    this.resourcesList = [];
                    this.$nextTick(() => {
                        this.resourcesList = this.parseData(data);
                    });
                    this.total = num;
                    this.isLoading = false;
                },
            );
        },
        parseData(data) {
            // eslint-disable no-param-reassign
            const {
                stageList,
                subjectList,
                moduleList,
                versionList,
            } = this.filtersList;

            const map = {
                wdStageId: stageList,
                wdSubjectId: subjectList,
                VersionId: versionList,
                ResType: moduleList,
            };

            data.forEach((v) => {
                Object.keys(map).forEach((item) => {
                    const res = map[item].find((data) => {
                        let key = item;

                        if (item === 'VersionId') {
                            key = 'id';
                        } else if (item === 'ResType') {
                            key = 'typeId';
                        }
                        return data[key] === v[item];
                    });
                    v[`${item}Name`] = res
                        ? res.name || res.subjectName || res.stageName
                        : '';
                });

                v.downloadStatus = '下载';
                v.AddCourseStatus = '添加到课程';
                if (this.collectList.includes(Number(v.ResId))) {
                    v.AddCourseStatus = '已添加';
                    v.disabledAdd = true;
                }
                v.name = v.Name;
                v.Name = v.Name.replace(/<\/?.+?\/?>/g, '');
            });
            return data;
        },
        handleChangePageSize(pageSize) {
            this.params.limit = pageSize;
            this.getResourcesList(1);
        },
        handleShow() {
            this.show = true;
            this.selected = this.current;
        },
        handleParams(data = this.current) {
            const params = {
                ...this.params,
                ...data,
            };
            this.params = params;
            this.resourcesList = [];
            this.getResourcesList(1);
            this.isLoading = true;
        },
    },
};
</script>

<style scoped></style>
