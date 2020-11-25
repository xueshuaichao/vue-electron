<template>
    <div>
        <div
            v-for="(item, index) in resourcesList"
            :key="item.timer"
            class="item flex-row"
        >
            <img
                src="../../../../assets/images/cloud/file.png"
                alt=""
            >
            <div class="course">
                <p
                    class="title"
                    @click="handleClickItem(item)"
                    v-html="item.name"
                />
                <div class="info flex-row">
                    <div class="button">
                        {{ item.ResTypeName }}
                    </div>
                    <!-- <p>大小：100K</p> -->
                </div>
                <div class="label-wrapper flex-row">
                    <div class="button">
                        {{ item.wdStageIdName }}
                    </div>
                    <div
                        v-if="item.wdSubjectIdName"
                        class="button"
                    >
                        {{ item.wdSubjectIdName }}
                    </div>
                    <div
                        v-if="item.VersionIdName"
                        class="button"
                    >
                        {{ item.VersionIdName }}
                    </div>
                </div>
            </div>
            <div class="button-wrapper flex-row">
                <div
                    class="button download flex-row"
                    :class="item.disabled ? 'disabled' : ''"
                    @click.stop="handleDownload(item, false)"
                >
                    <img
                        src="../../../../assets/images/app/download_white@2x.png"
                        alt=""
                    >
                    {{ item.downloadStatus }}
                </div>
                <div
                    class="button add-course flex-row"
                    :class="item.disabledAdd ? 'disabled' : ''"
                    @click.stop="handleAddCourse(item, index)"
                >
                    <img
                        src="../../../../assets/images/app/addto@2x.png"
                        alt=""
                    >
                    {{ item.AddCourseStatus }}
                </div>
            </div>
        </div>
        <setPath
            :modal1="showPath"
            :set-path-param="setPathParam"
            :path="path"
            @ok="ok"
            @cancel="cancel"
        />
    </div>
</template>

<script>
import fs from 'fs';
import { mapGetters } from 'vuex';
import api from '@/api/resources';
import setPath from '@/components/setPath/index.vue';
import commonmethods from '../../../home/commonmethods';

export default {
    name: 'Index',
    components: {
        setPath,
    },
    mixins: [commonmethods],
    props: {
        resourcesList: {
            type: Array,
            default() {
                return [];
            },
        },
    },
    data() {
        return {
            showPath: false,
            path: '',
            currentItem: {},
            setPathParam: {},
        };
    },
    computed: {
        ...mapGetters([
            'userAppConfig',
            'userInfo',
            'downloadedFile',
            'collectList',
        ]),
    },
    methods: {
        handleDownload(item, allow) {
            const { userDownloadPath, isDownloadPath } = this.userAppConfig;
            if (item.disabled) return;

            if ((!isDownloadPath || !userDownloadPath) && !allow) {
                this.setPathParam = {
                    name: item.Name,
                    // size: formateFileSize(row.size),
                };
                if (userDownloadPath) {
                    this.path = userDownloadPath;
                } else {
                    this.path = this.$remote.app.getPath('downloads');
                }
                this.currentItem = item;
                this.showPath = true;
                return;
            }
            if (!item.upUrl) {
                this.$Message.error('下载地址异常，无法下载');
                return;
            }
            this.downloadFunction(item);
        },
        handleAddCourse(item, index) {
            if (item.disabledAdd) return;
            this.showPath = false;
            api.collect({
                type: 1,
                resId: item.ResId,
                wdUserId: this.userInfo.loginid,
            }).then(() => {
                this.$set(this.resourcesList, index, {
                    ...item,
                    disabledAdd: true,
                    AddCourseStatus: '已添加',
                });
            });
        },
        handleClickItem(item) {
            const result = this.downloadedFile.find(
                foo => foo.ResId === item.ResId,
            );
            if (!result) {
                this.$Message.info('该课程需要下载');
                return;
            }

            try {
                fs.accessSync(result.path);
                this.$shell.openItem(result.path);
            } catch (e) {
                this.$Message.info('该课程需要下载');
            }
        },
        cancel() {
            this.showPath = false;
        },
        ok() {
            this.showPath = false;
            this.handleDownload(this.currentItem, true);
        },
    },
};
</script>
