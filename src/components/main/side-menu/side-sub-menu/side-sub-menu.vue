<template>
    <div
        :name="menuItem.id"
        class="comp-side-sub-menu"
    >
        <!-- <template slot="title"> -->
        <div
            class="ssm-menu-item"
            :class="{ opened: isMenuOpen }"
        >
            <div
                class="ssm-item ivu-menu-item"
                :style="{ paddingLeft: `${15 * level}px` }"
                :data-id="menuItem.id"
                :class="{
                    'ivu-menu-item-active':
                        menuItem.id === curTextbook.chapterId &&
                        resTypeId === ''
                }"
                @click="toggleMenu(menuItem)"
            >
                <Icon
                    type="md-arrow-dropright"
                    class="icon-toggle"
                    :class="{ opened: isOpen === true }"
                    @click.stop="toggleFolder"
                />
                <span class="icon icon-mini-folder" />
                {{ menuItem.name }}
            </div>
            <!-- <i
                class="ivu-icon ivu-icon-ios-arrow-down ivu-menu-submenu-title-icon"
            /> -->
        </div>
        <!-- </template> -->

        <!-- 顶级目录 -->
        <div v-if="isOpen">
            <side-folder
                :level="level"
                :parent-id="menuItem.id"
                :process-item="[...processItem]"
                @changeProcess="changeProcess"
            />
        </div>

        <div
            v-if="isMenuOpen"
            class="ssm-sub-menu"
        >
            <template v-for="(item, k) in currentLevelMenu">
                <template v-if="item.next1 && item.next1.length">
                    <side-sub-menu
                        :key="item.id"
                        :index="`${index}_${k}`"
                        :process-item="[
                            ...processItem,
                            {
                                name: item.name,
                                chapterId: item.id,
                                routeParam: {
                                    name: 'HomeIndex'
                                }
                            }
                        ]"
                        :menu-item="item"
                        :level="level + 1"
                    />
                </template>
                <template v-else>
                    <div
                        :key="item.id"
                        class="ssm-menu-item"
                    >
                        <div
                            class="ssm-item ivu-menu-item"
                            :style="{ paddingLeft: `${15 * (level + 1)}px` }"
                            :data-id="item.id"
                            :class="{
                                'ivu-menu-item-active':
                                    item.id === curTextbook.chapterId &&
                                    resTypeId === ''
                            }"
                            @click="onSelectChapter(item, 2)"
                        >
                            <Icon
                                type="md-arrow-dropright"
                                class="icon-toggle"
                                :class="{ opened: item.isOpen === true }"
                                @click.stop="toggleItemFolder(item)"
                            />
                            <span class="icon icon-mini-folder" />
                            {{ item.name }}
                        </div>
                    </div>
                    <!-- </template> -->
                    <!-- </submenu> -->
                    <div
                        v-if="item.isOpen"
                        :key="item.id + '_type_list'"
                    >
                        <side-folder
                            :parent-id="item.id"
                            :level="level + 1"
                            :process-item="[
                                ...processItem,
                                {
                                    name: item.name,
                                    chapterId: item.id,
                                    routeParam: {
                                        name: 'HomeIndex'
                                    }
                                }
                            ]"
                            @changeProcess="changeProcess"
                        />
                    </div>
                </template>
            </template>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import SideFolder from '../side-folder';
import store from '../../../../store';

export default {
    name: 'SideSubMenu',
    components: {
        SideFolder,
    },
    props: {
        level: {
            type: Number,
            default: 0,
        },
        menuItem: {
            type: Object,
            default() {
                return {};
            },
        },
        saveItem: {
            type: Object,
            default() {
                return {};
            },
        },
        index: {
            type: String,
            default() {
                return '';
            },
        },
        processItem: {
            type: Array,
            default() {
                return [];
            },
        },
    },
    data() {
        const { menuOpenNames } = this.$store.state.textbook.current;
        return {
            isMenuOpen: menuOpenNames.indexOf(this.menuItem.id) !== -1,
            isOpen: false,
            currentLevelMenu: this.menuItem.next1.map(item => ({
                ...item,
                isOpen: false,
            })),
        };
    },
    computed: {
        ...mapState({
            curTextbook: state => state.textbook.current,
            resTypeId: state => state.textbook.resTypeId,
        }),
    },
    created() {
        // 如果之前有存储路径
        if (this.curTextbook.way && typeof this.curTextbook.way === 'object') {
            store.commit('changenextWayArr', '');
            store.commit('changeWay', this.curTextbook.way);
            this.$router.push({
                name: 'HomeIndex',
            });
        } else if (
            // 如果没有存储路径
            this.curTextbook.chapterId === this.processItem[0].chapterId
        ) {
            store.commit('changenextWayArr', '');
            store.commit('changeWay', this.processItem);
            this.$router.push({
                name: 'HomeIndex',
            });
        }
    },
    methods: {
        ...mapActions(['selectChapter', 'openMenu', 'saveWay']),
        onSelectChapter(item, type) {
            // 相应menu点击，改变路径
            this.changeProcess(item, type);
            this.selectChapter(item.id);
            this.$router.push({
                name: 'HomeIndex',
            });
        },
        changeProcess(item, type) {
            if (!type) {
                return;
            }
            let result = '';
            if (type === 2) {
                // 二级目录
                result = [
                    ...this.processItem,
                    {
                        name: item.name,
                        chapterId: item.id,
                        routeParam: {
                            name: 'HomeIndex',
                        },
                    },
                ];
            }
            if (type === 1) {
                // 一级目录
                result = this.processItem;
            }
            if (type === 3) {
                // 三级目录
                result = item;
            }
            if (type !== 3) {
                this.saveWay(result);
            }
            store.commit('changenextWayArr', '');
            store.commit('changeWay', result);
        },
        toggleFolder() {
            this.isOpen = !this.isOpen;
            console.log(this.isOpen);
        },
        toggleMenu(item) {
            this.changeProcess(item, 1);
            const { id } = item;
            const arrOpenedMenus = this.curTextbook.menuOpenNames || [];
            this.isMenuOpen = !this.isMenuOpen;
            this.onSelectChapter(item);
            if (this.isMenuOpen) {
                if (arrOpenedMenus.indexOf(id) === -1) {
                    arrOpenedMenus.push(id);
                }
            } else {
                this.closeMenu(item, arrOpenedMenus);
            }
            this.openMenu(arrOpenedMenus);
        },
        // close menu recursively
        closeMenu(menu, arrOpenedMenus) {
            const index = arrOpenedMenus.indexOf(menu.id);
            if (index !== -1) {
                arrOpenedMenus.splice(index, 1);
            }
            if (menu.next1 && menu.next1.length) {
                menu.next1.forEach((item) => {
                    this.closeMenu(item, arrOpenedMenus);
                });
            }
        },
        toggleItemFolder(item) {
            console.log(item, 'item');
            // eslint-disable-next-line no-param-reassign
            item.isOpen = !item.isOpen;
        },
    },
};
</script>

<style lang="less">
.comp-side-sub-menu {
    .ssm-menu-item {
        // padding: 12px 10px;
        position: relative;

        .ivu-icon-ios-arrow-down {
            transition: transform 0.2s ease-in-out;
        }

        &.opened {
            .ivu-icon-ios-arrow-down {
                transform: translateY(-50%) rotate(180deg);
            }
        }
    }

    .menu-no-child .ivu-menu-submenu-title-icon {
        display: none;
    }

    .active {
        color: #2d8cf0;
    }
    .ssm-item {
        // padding-right: 15px;
    }

    .ivu-icon.icon-toggle {
        transition: transform 0.2s ease-in-out;
    }
    .ivu-icon.icon-toggle::before {
        font-size: 24px;
    }
    .ivu-icon.icon-toggle.opened {
        transform: rotate(90deg);
    }
    .ivu-menu-item {
        font-size: 12px;
    }
}
</style>
