<template>
    <div
        ref="rootElem"
        class="comp-side-menu"
        @scroll.passive="handleScroll"
    >
        <div class="menu-header-wrap">
            <div class="menu-header">
                <Dropdown
                    class="dropdown-choose"
                    :trigger="'click'"
                    @on-visible-change="onToggleDropdown"
                    @on-click="onSelectTextbook"
                >
                    <div class="title">
                        {{ current.label }}
                    </div>
                    <div class="status open-status">
                        <Icon
                            type="ios-arrow-down"
                            :class="{
                                'icon-rotate': state.dropdownOpened
                            }"
                        />
                    </div>

                    <DropdownMenu slot="list">
                        <DropdownItem
                            v-for="(item, k) in textbookList"
                            :key="item.fasId"
                            :title="item.label"
                            :name="k"
                            :selected="current.fasId === item.fasId"
                        >
                            {{ item.label }}
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>

                <div class="btn">
                    <Dropdown
                        :visible="state.addFormOpened"
                        :class="'dropdown-add'"
                        :trigger="'custom'"
                        :placement="'bottom-end'"
                    >
                        <div
                            class="btn-add"
                            @click="state.addFormOpened = !state.addFormOpened"
                        />
                        <DropdownMenu
                            slot="list"
                            :class="'dropdown-add'"
                        >
                            <add-resource-form ref="textbookForm" />
                            <div class="footer">
                                <Button
                                    style="margin-left: 32px"
                                    type="primary"
                                    @click="onAddTextbook()"
                                >
                                    新增
                                </Button>
                                <Button
                                    style="margin-left: 44px"
                                    @click="onCancel()"
                                >
                                    取消
                                </Button>
                            </div>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>
        </div>

        <div
            v-if="menuList.length"
            class="menu-content"
        >
            <Menu
                :theme="theme2"
                :width="'auto'"
            >
                <side-sub-menu
                    v-for="(item, k) in menuList"
                    :key="item.id"
                    :index="k.toString()"
                    :menu-item="item"
                    :process-item="[
                        {
                            name: item.name,
                            chapterId: item.id,
                            routeParam: {
                                name: 'HomeIndex'
                            }
                        }
                    ]"
                />
            </Menu>
        </div>
    </div>
</template>

<script>
import { mapMutations, mapState, mapActions } from 'vuex';
import SideSubMenu from './side-sub-menu';
import AddResourceForm from './add-resource-form.vue';
import { debounce } from '../../../utils';

export default {
    components: {
        SideSubMenu,
        AddResourceForm,
    },
    data() {
        return {
            theme2: 'light',
            visible: false,
            state: {
                dropdownOpened: false,
                addFormOpened: false,
            },
        };
    },
    computed: {
        ...mapState({
            // map `this.doneCount` to `this.$store.getters.doneTodosCount`
            menuList: state => state.textbook.chapterAsyncData,
            textbookList: state => state.textbook.textbooks,
            current: state => state.textbook.current,
        }),
    },
    watch: {
        menuList() {
            const { menuScrollTop } = this.$store.state.textbook.current;
            this.$nextTick(() => {
                console.log(this.menuList.length);
                console.log('start >>>>:', menuScrollTop);
                this.$refs.rootElem.scrollTop = menuScrollTop;
            });
        },
    },
    mounted() {
        setTimeout(() => {
            console.log(this.current, 'current');
        }, 1000);
    },
    methods: {
        handlePopperHide(name) {
            this.$refs[name].resetFields();
        },
        getDirInfo(dir) {
            return {
                name: dir.name,
                id: dir.id,
            };
        },
        ...mapMutations(['setDir']),
        ...mapActions([
            'addTextbook',
            'selectTextbook',
            'getChapterAsync',
            'initializeTextbook',
            'openMenu',
            'setMenuScrollTop',
        ]),
        onToggleDropdown(isVisiable) {
            this.state.dropdownOpened = isVisiable;
        },
        onSelectTextbook(i) {
            console.log(i, '112233');
            this.selectTextbook(i);
        },
        onAddTextbook() {
            this.$refs.textbookForm.validate().then((config) => {
                this.addTextbook(config);
                this.state.addFormOpened = false;
            });
        },
        onCancel() {
            this.state.addFormOpened = false;
            setTimeout(() => {
                this.$refs.textbookForm.reset();
            }, 300);
        },
        onOpenChange(val) {
            this.openMenu(val);
        },
        handleScroll: debounce(function save() {
            console.log('======> save pos:', this.$refs.rootElem.scrollTop);
            this.setMenuScrollTop(this.$refs.rootElem.scrollTop);
        }, 100),
    },
};
</script>

<style lang="less">
.comp-side-menu {
    // background: lightsalmon;
    overflow-y: auto;
    height: 100%;
    width: 208px;
    -webkit-user-select: none;
    // -webkit-app-region: drag;

    .ivu-select-dropdown-list {
        max-height: 142px;
        overflow-y: scroll;
    }

    .menu-header {
        line-height: 48px;
        padding: 0 8px 0 18px;
        display: flex;
        border-bottom: 1px solid rgba(236, 236, 236, 1);
        height: 48px;
        .dropdown-choose {
            flex: 1;
            overflow: hidden;

            .ivu-dropdown-rel {
                display: flex;
                cursor: pointer;

                .title {
                    flex: 1;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                }
                .status {
                    width: 16px;

                    .ivu-icon {
                        transition: transform 0.2s ease-in-out;
                    }
                }
            }

            .ivu-select-dropdown {
                max-height: 210px !important;
                overflow-y: auto;
                z-index: 1000;
                width: 280px;
            }
            .ivu-dropdown-item {
                line-height: 42px;
                box-sizing: border-box;
                padding: 0 16px;
                text-overflow: ellipsis;
                overflow: hidden;
            }

            .icon-rotate {
                transform: rotate(180deg);
            }
        }
        .dropdown-add {
            > .ivu-select-dropdown {
                z-index: 1000;
                width: 280px;
                padding: 0;
            }

            .footer {
                background: #f7f4f8;
                height: 56px;

                .ivu-btn {
                    width: 86px;
                    height: 32px;
                    border-radius: 2px;
                    margin-top: 6px;

                    &.ivu-btn-primary {
                        background: rgba(49, 151, 250, 1);
                        box-shadow: 0px 1px 2px 0px rgba(0, 79, 164, 0.6);
                    }
                    &.ivu-btn-default {
                        background: rgba(0, 0, 0, 0.1);
                        border-radius: 2px;
                        border: 1px solid rgba(0, 0, 0, 0.2);
                    }
                }
            }
        }

        .btn {
            margin-left: 8px;
            width: 32px;
        }
        .btn-add {
            width: 32px;
            height: 32px;
            display: inline-block;
            background: url("../../../assets/images/app/comp/menu/add.png");
            background-size: 100% 100%;
            position: relative;
            top: 8px;
            cursor: pointer;
        }
    }

    .menu-content {
        overflow-y: scroll;
        height: calc(100% - 48px);
    }

    .ivu-icon:before {
        font-size: 16px;
    }

    font-size: 14px;
    .icon-mini-folder {
        vertical-align: middle;
        display: inline-block;
        width: 24px;
        height: 24px;
        background: url("../../../assets/images/app/comp/menu/folder.png");
        background-size: 100% 100%;
    }

    border-right: 2px solid #ececec;
    .ivu-menu-vertical.ivu-menu-light:after {
        width: 0;
    }
    .ivu-menu {
        z-index: 100;
    }
    .comp-select {
        height: 48px;
        display: flex;
        justify-content: space-around;
        align-items: center;
        z-index: 999;
        border-bottom: 1px solid #ececec;
    }

    .ssm-item {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 12px;
    }
}
</style>
