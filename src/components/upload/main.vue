<template>
    <div class="root-elem">
        <comHeader :active="'page-upload'" />
        <div class="root-container">
            <div class="side-menu-wrapper">
                <comSideMenu />
            </div>
            <div class="content-wrapper">
                <keep-alive :include="cacheList">
                    <router-view />
                </keep-alive>
            </div>
        </div>
    </div>
</template>

<script>
import comHeader from '@/components/header/index.vue';
import comSideMenu from '@/components/upload/side-menu';

export default {
    components: {
        comHeader,
        comSideMenu,
    },
    data() {
        return {
            cacheList: [],
        };
    },
    computed: {},
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
        position: relative;
    }
}
</style>
