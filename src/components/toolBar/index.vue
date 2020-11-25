<template>
    <div class="toolBar">
        <div class="toolBar1">
            <slot name="header-btn" />
        </div>
        <div class="toolBar2">
            <div class="processBtn">
                <Button
                    class="little-btn"
                    type="primary"
                    :disabled="way.length - 1 <= 0"
                    icon="ios-arrow-back"
                    @click="goBack"
                />
                <Button
                    class="little-btn"
                    type="primary"
                    :disabled="nextWayArr.length === 0"
                    icon="ios-arrow-forward"
                    @click="next"
                />
            </div>
            <div class="process">
                <div class="process-bar">
                    <div>
                        <Icon
                            type="ios-book"
                            color="rgba(0,0,0,0.2)"
                        />
                    </div>
                    <div
                        v-if="
                            way[way.length - 1] &&
                                way[way.length - 1].holderType &&
                                way[way.length - 1].holderType === 'all'
                        "
                    >
                        <span>
                            <Icon
                                type="ios-arrow-forward"
                                color="rgba(0,0,0,0.2)"
                            />
                            我的文件
                        </span>
                        <span>
                            <Icon
                                type="ios-arrow-forward"
                                color="rgba(0,0,0,0.2)"
                            />
                            {{ way[way.length - 1].name }}
                        </span>
                    </div>
                    <div v-else>
                        <template v-for="(item, index) in way">
                            <span
                                :key="index"
                                :class="
                                    item.type === 'search' ? '' : 'process-item'
                                "
                                @click="handleprocessroute(item, index + 1)"
                            >
                                <Icon
                                    type="ios-arrow-forward"
                                    color="rgba(0,0,0,0.2)"
                                />
                                {{ item.name }}
                            </span>
                        </template>
                    </div>
                </div>
            </div>
            <Button
                class="little-btn"
                style="margin-top:5px;margin-right:5px"
                icon="md-refresh"
                @click="$emit('refresh')"
            />
            <div class="searchBox">
                <Poptip
                    v-model="visible"
                    content="content"
                    placement="bottom-start"
                >
                    <Button
                        class="little-btn"
                        icon="md-swap"
                    />
                    <div
                        slot="content"
                        class="context"
                    >
                        <Card
                            :bordered="false"
                            :padding="0"
                        >
                            <ul>
                                <li @click="handleScope('all')">
                                    全部文件
                                </li>
                                <li @click="handleScope('current')">
                                    当前目录
                                </li>
                            </ul>
                        </Card>
                    </div>
                </Poptip>
                <Input
                    v-model="inputVal"
                    :placeholder="placeholder"
                    clearable
                    style="width: 200px"
                    @on-enter="handleSearch"
                />
                <Button
                    class="little-btn"
                    type="primary"
                    icon="ios-search"
                    @click="handleSearch"
                />
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import store from '../../store';
// import { debounce } from '../../utils';

export default {
    data() {
        return {
            holderType: 'current',
            visible: false,
            inputVal: this.$route.params.txt || '',
            isabled: true,
            isabled1: true,
        };
    },
    computed: {
        ...mapState({
            nextWayArr: state => state.app.nextWayArr,
            way: state => state.app.way,
        }),
        placeholder() {
            return this.holderType === 'all' ? '搜索全部文件' : '搜索当前目录';
        },
    },
    created() {
        console.log(this.way[this.way.length - 1], 'way[way.length-1]');
    },
    methods: {
        handleprocessroute(item, index) {
            console.log(item, 'item11');
            if (item.type === 'search') {
                return;
            }
            const newarr = this.way.slice(0, index);
            this.$store.dispatch('selectChapter', item.chapterId);
            store.commit('changenextWayArr', '');
            this.$router.push(item.routeParam);
            store.commit('changeWay', newarr);
        },
        typeofData(item) {
            let type = 'string';
            if (Array.isArray(item)) {
                type = 'array';
            } else if (typeof item === 'object') {
                type = 'object';
            }
            return type;
        },
        goBack() {
            console.log(this.isabled, 'isabled');
            // if (!this.isabled) {
            //     return;
            // }
            // this.isabled = false;
            // setTimeout(() => {
            //     this.isabled = true;
            // }, 3000);
            this.inputVal = '';
            const currentRouteParam = this.way.pop();
            console.log(currentRouteParam, '后退一步');
            this.$store.dispatch(
                'selectChapter',
                this.way[this.way.length - 1].chapterId,
            );
            this.$router.push(this.way[this.way.length - 1].routeParam);
            store.commit('changenextWayArr', currentRouteParam);
        },
        next() {
            console.log(this.isabled1, 'isabled');
            // if (!this.isabled1) {
            //     return;
            // }
            // this.isabled1 = false;
            // console.log(this.isabled1, 'isabled11');
            // setTimeout(() => {
            //     this.isabled1 = true;
            // }, 3000);
            const processParam = this.nextWayArr.shift();
            console.log(processParam, '前进一步');
            this.$store.dispatch('selectChapter', processParam.chapterId);
            this.$router.push(processParam.routeParam);
            const { way } = store.state.app;
            way.push(processParam);
            store.commit('changeWay', way);
        },
        handleScope(scope) {
            this.visible = false;
            if (this.holderType !== scope) {
                this.holderType = scope;
                this.inputVal = '';
            }
        },
        handleSearch() {
            if (!this.inputVal) {
                this.$Message.warning('请输入搜索内容');
                return;
            }
            this.$emit('search', {
                value: this.inputVal,
                holderType: this.holderType,
            });
        },
    },
};
</script>

<style lang="less">
.toolBar {
    .little-btn {
        height: 32px;
        width: 32px;
        .ivu-icon {
            margin-left: -7px;
            margin-top: -2px;
            font-size: 16px;
        }
    }
    .process-item {
        cursor: pointer;
        &:hover {
            color: #0279f7;
        }
    }
    color: #2c3e50;
    .toolBar1 {
        width: 100%;
        height: 48px;
        padding: 8px 18px;
        box-sizing: border-box;
        background: rgba(255, 255, 255, 1);
        border-bottom: 1px solid rgba(236, 236, 236, 1);
        button {
            height: 32px;
            padding: 0 16px;
            margin-right: 16px;
            font-size: 14px;
        }
    }
    .toolBar2 {
        width: 100%;
        height: 42px;
        // line-height: 48px;
        padding: 0 8px;
        box-sizing: border-box;
        background: rgba(255, 255, 255, 1);
        border-bottom: 1px solid rgba(236, 236, 236, 1);
        display: flex;
        justify-content: space-between;
        .processBtn {
            width: 73px;
            padding-top: 5px;
            border-right: 1px solid rgba(236, 236, 236, 1);
            button {
                margin-right: 4px;
            }
        }
        .process {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 6px;
            overflow: hidden;
            .process-bar {
                display: flex;
                flex: 1;
                font-size: 14px;
                overflow: hidden;
                & div:nth-child(2) {
                    flex: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
        }
        .searchBox {
            padding-top: 5px;
            border-left: 1px solid rgba(236, 236, 236, 1);
            // padding-left: 8px;
            button {
                margin-left: 6px;
            }
            .ivu-poptip-popper {
                min-width: 120px;
                .ivu-poptip-body {
                    padding: 0;
                    .ivu-card-body {
                        li {
                            height: 32px;
                            line-height: 32px;
                            padding-left: 8px;
                            cursor: pointer;
                            &:hover {
                                background: rgba(0, 0, 0, 0.04);
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>
