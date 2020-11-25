<template>
    <div class="search-bar">
        <Input
            v-model="keyword"
            search
            clearable
            enter-button="搜索一下"
            placeholder="搜索资源"
            @on-search="handleDebounce(null, 'keyword')"
        />
        <div class="category-wrapper flex-row">
            <div
                v-for="(item, index) in moduleList"
                :key="index"
                class="button"
                :class="currentItem === index ? 'active' : ''"
                @click="handleDebounce(item, 'resType', index)"
            >
                {{ item.name }}
            </div>
        </div>
    </div>
</template>

<script>
import { mapMutations } from 'vuex';
import api from '@/api/resources';
import { debounce } from '../../../../utils';

export default {
    name: 'Index',
    props: {
        selected: {
            type: Object,
            default() {
                return {
                    resType: 0,
                };
            },
        },
    },
    data() {
        return {
            currentItem: 1,
            moduleList: [],
            keyword: '',
            params: {},
        };
    },
    watch: {
        selected(val) {
            if (val) {
                this.keyword = '';
                this.setDefaultSelected(val);
            }
        },
    },
    created() {
        this.getModuleList();
        this.handleDebounce();
    },
    methods: {
        ...mapMutations(['setFiltersList']),
        getModuleList() {
            return api.getModuleList({ modId: 5 }).then(({ data }) => {
                data.unshift({ name: '全部', typeId: '' });
                this.moduleList = data;
                this.setFiltersList({ moduleList: data });
            });
        },
        setDefaultSelected(val) {
            this.params.resType = val.resType;
            this.currentItem = this.moduleList.findIndex(
                v => v.typeId === val.resType,
            );
        },
        handleClickItem(item, key, index) {
            this.params[key] = key === 'resType' ? item.typeId : this.keyword;
            if (item) {
                this.currentItem = index;
            }
            this.$emit('on-success', this.params);
        },
        handleDebounce() {
            this.handleDebounce = debounce(this.handleClickItem, 800);
        },
    },
};
</script>
