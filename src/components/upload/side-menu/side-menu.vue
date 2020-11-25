<template>
    <div class="comp-side-menu">
        <Menu
            :theme="theme2"
            :width="'auto'"
            :active-name="activeName"
            @on-select="handleSelect"
        >
            <MenuItem
                v-for="item in menuList"
                :key="item.id"
                :name="item.id"
            >
                <Icon :type="item.icon" />
                {{ item.name }}
                {{
                    item.name === "正在上传"
                        ? uploadNum === 0
                            ? ""
                            : `(${uploadNum})`
                        : ""
                }}
                {{
                    item.name === "正在下载"
                        ? downloadNum === 0
                            ? ""
                            : `(${downloadNum})`
                        : ""
                }}
                {{
                    item.name === "传输完成"
                        ? completeNum === 0
                            ? ""
                            : `(${completeNum})`
                        : ""
                }}
            </MenuItem>
        </Menu>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    components: {},
    data() {
        return {
            theme2: 'light',
            menuList: [
                {
                    id: 'upload',
                    icon: 'md-cloud-upload',
                    name: '正在上传',
                },
                {
                    id: 'download',
                    icon: 'md-download',
                    name: '正在下载',
                },
                {
                    id: 'complete',
                    icon: 'ios-checkmark-circle',
                    name: '传输完成',
                },
            ],
        };
    },
    computed: {
        ...mapGetters(['uploadNum', 'downloadNum', 'completeNum']),
        activeName() {
            return this.$route.name;
        },
    },
    created() {},
    methods: {
        handleSelect(name) {
            console.log(name);
            this.$router.push({ name });
        },
    },
};
</script>

<style lang="less" scoped>
.comp-side-menu {
    background: #fff;
    height: 100%;
}
</style>
