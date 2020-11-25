<template>
    <div>
        <div class="title">
            资源筛选
            <i-button
                :disabled="disabled"
                @click="handleReset"
            >
                重置
            </i-button>
        </div>
        <div class="category-wrapper">
            <div class="item">
                <h5>学段</h5>
                <div class="flex-row">
                    <div
                        v-for="(item, index) in stageList"
                        :key="index"
                        class="button"
                        :class="
                            currentItems.wdStageId === index ? 'active' : ''
                        "
                        @click="handleDebounce(item, 'wdStageId', index)"
                    >
                        {{ item.stageName }}
                    </div>
                </div>
            </div>
            <div class="item">
                <h5>学科</h5>
                <div class="flex-row">
                    <div
                        v-for="(item, index) in subjectList"
                        :key="index"
                        class="button"
                        :tag="item.subjectName"
                        :class="
                            currentItems.wdSubjectId === index ? 'active' : ''
                        "
                        @click="handleDebounce(item, 'wdSubjectId', index)"
                    >
                        {{ item.subjectName }}
                    </div>
                </div>
            </div>
            <div class="item">
                <h5 class="flex-row">
                    版本
                    <Icon
                        v-if="showVersionListMore"
                        :type="
                            isOpenVersionList
                                ? 'ios-arrow-up'
                                : 'ios-arrow-down'
                        "
                        :size="font"
                        @click="handleOpenAllList('VersionList')"
                    />
                </h5>
                <div class="flex-row">
                    <div
                        v-for="(item, index) in versionList"
                        :key="index"
                        class="button"
                        :class="
                            currentItems.versionId === index ? 'active' : ''
                        "
                        @click="handleDebounce(item, 'versionId', index)"
                    >
                        {{ item.name }}
                    </div>
                </div>
            </div>
            <div class="item">
                <h5 class="flex-row">
                    册别
                    <Icon
                        v-if="showFascicleListMore"
                        :type="
                            isOpenFascicleList
                                ? 'ios-arrow-up'
                                : 'ios-arrow-down'
                        "
                        :size="font"
                        @click="handleOpenAllList('FascicleList')"
                    />
                </h5>
                <div class="flex-row">
                    <div
                        v-for="(item, index) in fascicleList"
                        :key="index"
                        class="button"
                        :class="currentItems.fasId === index ? 'active' : ''"
                        @click="handleDebounce(item, 'fasId', index)"
                    >
                        {{ item.name }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable no-param-reassign */
import { mapMutations } from 'vuex';
import api from '@/api/resources';
import { debounce } from '../../../../utils';

let params = {
    wdSiteId: '',
    wdStageId: '',
    wdSubjectId: '',
    versionId: '',
    fasId: '',
};

const filtersList = {
    versionList: [],
    fascicleList: [],
};

const FILTERS_TO_LIST_MAP = {
    wdStageId: 'getStage',
    wdSubjectId: 'getSubject',
    fasId: 'getFascicle',
    versionId: 'getVersion',
};

const DEFAULT_MAX_NUMS = 10;

export default {
    name: 'SiderFilter',
    props: {
        selected: {
            type: Object,
            default() {
                return {
                    wdStageId: 0,
                    wdSubjectId: 0,
                    versionId: 0,
                    fasId: 0,
                };
            },
        },
        width: {
            type: String,
            default: '260',
        },
        font: {
            type: Number,
            default: 20,
        },
    },
    data() {
        return {
            stageList: [],
            subjectList: [],
            versionList: [],
            fascicleList: [],
            currentItems: {
                wdStageId: 0,
                wdSubjectId: 0,
                versionId: 0,
                fasId: 0,
            },
            isOpenVersionList: false,
            isOpenFascicleList: false,
            isFirstLoad: true,
            disabled: false,
            showVersionListMore: false,
            showFascicleListMore: false,
        };
    },
    watch: {
        selected(val) {
            params = val;
            this.isFirstLoad = true;
            this.getAllData();
        },
    },
    created() {
        this.handleDebounce();
    },
    methods: {
        ...mapMutations(['setFiltersList']),
        getAllData(
            filters = ['getStage', 'getSubject', 'getVersion', 'getFascicle'],
        ) {
            Promise.all(filters.map(v => this[v]())).then(() => {
                const { stageList, subjectList } = this;
                if (this.isFirstLoad) {
                    this.setDefaultSelected();
                    this.$emit('on-select-end');
                    this.isFirstLoad = false;
                }
                this.setFiltersList({
                    stageList,
                    subjectList,
                    ...filtersList,
                });
            });
        },
        getStage() {
            const { wdSiteId } = params;
            return api.getStage({ wdSiteId }).then(({ data }) => {
                data[0].stageName = '全部';
                this.stageList = data;
            });
        },
        getSubject() {
            const { wdSiteId, wdStageId } = params;
            return api.getSubject({ wdSiteId, wdStageId }).then(({ data }) => {
                data[0].subjectName = '全部';
                this.subjectList = data;
            });
        },
        getVersion() {
            const { wdSiteId, wdStageId, wdSubjectId } = params;
            return api
                .getVersion({ wdSiteId, wdStageId, wdSubjectId })
                .then(({ data }) => {
                    const flag = data.length > DEFAULT_MAX_NUMS;
                    data.unshift({ name: '全部', id: '' });
                    filtersList.versionList = data;
                    this.showVersionListMore = flag;
                    this.versionList = flag
                        ? data.slice(0, DEFAULT_MAX_NUMS)
                        : data;
                });
        },
        getFascicle() {
            const {
                wdSiteId, wdStageId, wdSubjectId, versionId,
            } = params;
            return api
                .getFascicle({
                    wdSiteId,
                    wdStageId,
                    wdSubjectId,
                    versionId,
                })
                .then(({ data }) => {
                    const flag = data.length > DEFAULT_MAX_NUMS;
                    data.unshift({ name: '全部', id: '' });
                    filtersList.fascicleList = data;
                    this.showFascicleListMore = flag;
                    this.fascicleList = flag
                        ? data.slice(0, DEFAULT_MAX_NUMS)
                        : data;
                });
        },
        setDefaultSelected() {
            const { currentItems } = this;
            const list = {
                wdStageId: 'stageList',
                wdSubjectId: 'subjectList',
                fasId: 'fascicleList',
                versionId: 'versionList',
            };

            Object.keys(currentItems).forEach((v) => {
                const key = v.includes('wd') ? v : 'id';
                currentItems[v] = this[list[v]].findIndex(
                    item => item[key].toString() === String(params[v]),
                );
            });
        },
        handleClickItem(item, key, index) {
            let val = '';
            const { currentItems } = this;
            const keys = Object.keys(currentItems);
            const reset = keys.slice(keys.indexOf(key) + (index ? 1 : 0));

            if (key === 'versionId' || key === 'fasId') {
                val = item.id;
            } else {
                val = item[key];
            }

            this.disabled = index === 0 && key === 'wdStageId';
            params[key] = val;
            currentItems[key] = index;
            this.getAllData(
                reset.map((v) => {
                    params[v] = '';
                    currentItems[v] = 0;
                    return FILTERS_TO_LIST_MAP[v];
                }),
            );
            this.$emit('on-select-end', params);
        },
        handleReset() {
            // this.handleClickItem(this.stageList[0], 'wdStageId', 0);
            this.handleDebounce(this.stageList[0], 'wdStageId', 0);
            this.disabled = true;
        },
        handleOpenAllList(key) {
            const flag = `isOpen${key}`;
            const name = key.charAt(0).toLocaleLowerCase() + key.slice(1);

            if (this[flag]) {
                this[flag] = false;
                this[name] = filtersList[name].slice(0, DEFAULT_MAX_NUMS);
            } else {
                this[flag] = true;
                this[name] = filtersList[name];
            }
            this.setDefaultSelected();
        },
        handleDebounce() {
            this.handleDebounce = debounce(this.handleClickItem, 600);
        },
    },
};
</script>
>
