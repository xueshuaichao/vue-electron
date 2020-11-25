<template>
    <div class="comp-side-folder">
        <menu-item
            v-for="item in resTypeList"
            :key="`${parentId}_${item.typeId}`"
            :name="`${parentId}_${item.typeId}`"
            :class="{
                'type-selected': `${parentId}_${item.typeId}` === resTypeId
            }"
            :style="{ paddingLeft: `${26 + 15 * (level + 1)}px` }"
            @click.native="openFolder(item)"
        >
            <!-- @click.native="getPosition(k)" -->
            <span class="icon icon-mini-folder" />
            {{ item.name }}
        </menu-item>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
    props: {
        parentId: {
            type: Number,
            default: 0,
        },
        level: {
            type: Number,
            default: 0,
        },
        processItem: {
            type: Array,
            default() {
                return [];
            },
        },
    },
    data() {
        return {};
    },
    created() {
        console.log(this.resTypeList);
    },
    computed: {
        ...mapState({
            resTypeList: state => state.textbook.resTypeList,
            resTypeId: state => state.textbook.resTypeId,
        }),
    },
    methods: {
        ...mapActions(['selectChapter']),
        openFolder(item) {
            // 需要更新一下章节 id
            this.$emit(
                'changeProcess',
                [
                    ...this.processItem,
                    {
                        name: item.name,
                        chapterId: this.parentId,
                        resType: item.typeId,
                        routeParam: {
                            name: 'HomeDetail',
                            params: {
                                chapterId: this.parentId,
                                resType: item.typeId,
                                fileFolderId: 'none',
                            },
                        },
                    },
                ],
                3,
            );
            this.selectChapter(this.parentId);
            this.$router.push({
                name: 'HomeDetail',
                params: {
                    chapterId: this.parentId,
                    resType: item.typeId,
                    fileFolderId: 'none',
                },
            });
        },
    },
};
</script>

<style lang="less">
.comp-side-folder {
    .type-selected {
        color: #2d8cf0 !important;
        background: #f0faff !important;

        &:after {
            display: block !important;
            content: " ";
            width: 2px;
            position: absolute;
            top: 0;
            bottom: 0;
            right: 0;
            background: #2d8cf0;
        }
    }
}
</style>
