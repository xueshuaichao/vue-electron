import Vue from 'vue';
import { mapState, mapMutations } from 'vuex';
import { v4 as uuidv4 } from 'uuid';
import api from '@/api/passport';
import resourceApi from '@/api/resources';

import store from '../../store';
import { getDate, getSuffix, formateFileSize } from '../../utils';
import db from '../../database';

export default {
    data() {
        return {};
    },
    computed: {
        ...mapState({
            uploadStatus: state => state.app.uploadStatus,
        }),
    },
    mounted() {
        // const dropZone = document.querySelectorAll(
        //     '#my-resource .ivu-table-row',
        // );
        // eslint-disable-next-line prefer-destructuring
        // this.currentTarget = dropZone[0];
        // dropZone.forEach((item, index) => {
        //     item.addEventListener('dragover', this.handleDragOver1, false);
        //     // eslint-disable-next-line no-param-reassign
        //     item.ondrop = (e) => {
        //         this.handleDrop1(index, e);
        //     };
        //     // eslint-disable-next-line no-param-reassign
        //     item.ondragenter = (e) => {
        //         this.handleDragEnter1(item, index, e);
        //     };
        //     item.addEventListener('dragleave', this.handleDragLeave1, false);
        // });
    },
    methods: {
        ...mapMutations(['openMainSpin']),
        addEventListener1() {
            const dropZone = document.querySelectorAll(
                '#my-resource .ivu-table-row',
            );
            dropZone.forEach((item, index) => {
                // eslint-disable-next-line no-param-reassign
                item.onmouseenter = () => {
                    Vue.set(this.data1, index, {
                        ...this.data1[index],
                        mouseover: true,
                    });
                };
                // eslint-disable-next-line no-param-reassign
                item.onmouseleave = () => {
                    Vue.set(this.data1, index, {
                        ...this.data1[index],
                        mouseover: false,
                    });
                    // item.setAttribute('class', 'ivu-table-row');
                };
            });
        },
        addEventListener2() {
            const dropZone = document.querySelectorAll(
                '#cloud-resource .ivu-table-row',
            );
            dropZone.forEach((item, index) => {
                // eslint-disable-next-line no-param-reassign
                item.onmouseenter = () => {
                    Vue.set(this.cloudData, index, {
                        ...this.cloudData[index],
                        mouseover: true,
                    });
                };
                // eslint-disable-next-line no-param-reassign
                item.onmouseleave = () => {
                    Vue.set(this.cloudData, index, {
                        ...this.cloudData[index],
                        mouseover: false,
                    });
                };
            });
        },
        // handleDrop1(index, e) {
        //     this.data1[index].uploading = true;
        //     const fileList = e.dataTransfer.files; // 获取文件对象
        //     api.fileUpload({
        //         img_file: fileList[0],
        //     }).then((data) => {
        //         console.log(data, '上传结果');
        //         // this.$Message.success('登录成功');
        //     });
        //     let { uploadNum } = store.state.app;
        //     uploadNum += fileList.length;
        //     store.commit('changeUploadNum', uploadNum);
        //     e.stopPropagation();
        //     e.preventDefault();
        // },
        // handleDragOver1(e) {
        //     e.stopPropagation();
        //     e.preventDefault();
        // },
        // handleDragLeave1(e) {
        //     e.preventDefault();
        // },
        handleDragOver(e) {
            e.preventDefault();
        },
        handleDragEnter(e) {
            e.preventDefault();
            e.stopPropagation();
        },
        handleDragLeave(e) {
            e.preventDefault();
        },
        // handleDragEnter1(item, index, e) {
        //     if (item !== this.currentTarget) {
        //         this.currentTarget.classList.remove('ivu-table-row-hover');
        //         this.currentTarget = item;
        //     }
        //     if (this.data1[index].fileType === 'file') {
        //         item.classList.add('ivu-table-row-hover');
        //     }
        //     e.preventDefault();
        // },
        addResource(param, callback) {
            const curTextbook = this.current;

            resourceApi
                .addResource({
                    fileUrl: param.fileUrl,
                    fileName: param.name,
                    fileSize: param.fileSize,
                    // 素材
                    resType: param.resType,
                    wdStageId: param.wdStageId,
                    wdSubjectId: param.wdSubjectId,
                    versionId: param.versionId,
                    fasId: param.fasId,
                    chapBranId: param.chapBranId,
                    wdSiteId: curTextbook.wdSiteId,
                    isPublic: 0,
                    wdUserId: this.userInfo.loginid,
                    roleId: 2,
                    type: 1,
                    // 资源分类
                    bigType: 1,
                    CheckStatus: 3,
                    fileFolderId: param.fileFolderId,
                })
                .then((data) => {
                    if (data.code === '0') {
                        callback(data);
                    } else {
                        this.$Message.error('出错啦~');
                    }
                })
                .catch(() => {
                    this.openMainSpin(false);
                });
        },

        handleDrop(e) {
            e.preventDefault();
            if (this.keyword) {
                return;
            }
            const fileList = [...e.dataTransfer.files];
            console.log(fileList, 'fileList11');
            fileList.forEach((item) => {
                console.log(getSuffix(item.name), 'bbb');
                if (
                    item.type
                    || getSuffix(item.name) === 'rp'
                    || getSuffix(item.name) === 'xmind'
                ) {
                    this.addUploadQueue(item, true);
                }
            });
            setTimeout(() => {
                this.checkisUploadWait();
            }, 500);
        },
        handleAllUpload(e) {
            const fileList = [...e.target.files];
            fileList.forEach((item) => {
                // 将图片转成DataURL格式
                this.addUploadQueue(item, true);
            });

            setTimeout(() => {
                this.checkisUploadWait();
            }, 500);
            this.$refs.file.value = '';
        },
        checkisUploadWait(row) {
            if (this.uploadNum < 5 && this.uploadQueue.length !== 0) {
                // 如果有正在下载数小于5就下载，否则不下载
                this.uploadNum += 1;
                // 执行下载操作
                this.uploadFunction({ ...this.uploadQueue[0] }, row);

                this.uploadQueue.shift();
                this.checkisUploadWait(row);
            }
        },
        upload(start, item, status, callback) {
            const fileObj = item.body;
            let Status = status;
            const chunkSize = 1024 * 1024;
            // if (start >= fileObj.size) {
            //     return;
            // }

            const end = start + chunkSize > fileObj.size
                ? fileObj.size
                : start + chunkSize;
            if (!Status) {
                // Status = start + chunkSize > fileObj.size ? 'end' : 'uploading';
                Status = start === fileObj.size ? 'end' : 'uploading';
            }
            console.log(start, fileObj.size, Status, 'type111');
            const bolbslice = fileObj.slice(start, end);
            const bolbslice1 = new File([bolbslice], fileObj.name, {
                type: fileObj.type,
            });
            api.fileUpload2({
                FileName: bolbslice1,
                Status,
            })
                .then((resp) => {
                    if (resp.status === 200) {
                        if (resp.data.status === 'uploading') {
                            if (
                                this.uploadStatus[item.uploadTimestamp]
                                && this.uploadStatus[item.uploadTimestamp]
                                    === 'pause'
                            ) {
                                callback({
                                    ...resp.data,
                                    status: 'pause',
                                });
                                return;
                            }
                            if (
                                this.uploadStatus[item.uploadTimestamp]
                                && this.uploadStatus[item.uploadTimestamp]
                                    === 'failed'
                            ) {
                                callback({
                                    ...resp.data,
                                    status: 'failed',
                                });
                                return;
                            }
                            callback(resp.data);
                            this.upload(
                                parseFloat(resp.data.size),
                                item,
                                false,
                                callback,
                            );
                        } else if (resp.data.status === 'end') {
                            callback({
                                ...resp.data,
                                status: 'completed',
                            });
                        } else if (resp.data.status === 'start') {
                            console.log(resp.data, 'start11');
                            this.upload(
                                parseFloat(resp.data.size),
                                item,
                                false,
                                callback,
                            );
                            callback({
                                ...resp.data,
                                status: 'uploading',
                            });
                        }
                    }
                })
                .catch(() => {
                    callback({
                        status: 'failed',
                    });
                });
        },
        uploadFunction(item, row, callback1) {
            console.log(item, row, 'itemdssds');
            let uploadParam = {
                way: item.way,
                wdStageId: item.wdStageId, // 学段
                wdSubjectId: item.wdSubjectId, // 学科
                versionId: item.versionId, // 版本 id
                fasId: item.fasId, // 分册 id
                chapBranId: item.chapBranId, // 章节
                resType: item.resType,
                uid: this.$store.state.textbook.uid,
                name: item.name,
                fileName: item.fileName,
                fileType: item.body.type,
                path: item.path,
                totalBytes: item.body.size,
                uploadTimestamp: item.uploadTimestamp,
                totalM: formateFileSize(item.body.size),
                type: 'upload',
                fileFolderId: item.fileFolderId,
                currentRouteParam: item.currentRouteParam,
            };
            this.upload(0, item, 'start', (data) => {
                // console.log(data, 'data111222');
                if (data.status === 'pause') {
                    uploadParam = {
                        ...uploadParam,
                        status: data.status,
                    };
                } else {
                    uploadParam = {
                        ...uploadParam,
                        progress:
                            parseFloat(
                                (
                                    (parseFloat(data.size) / item.body.size)
                                    * 100
                                ).toFixed(2),
                            ) || 0,
                        receivedM: formateFileSize(parseFloat(data.size)),
                        receivedBytes: parseFloat(data.size),
                        status: data.status,
                    };
                }
                // 更新上传状态
                this.updateUploadStatus(uploadParam, row);
                if (data.status === 'completed') {
                    this.addResourcFunction(
                        {
                            ...uploadParam,
                            // fileUrl: data.fullPath,
                            fileUrl: data.path,
                        },
                        callback1,
                    );
                } else if (data.status === 'pause') {
                    this.completeUploadStatus(
                        {
                            ...uploadParam,
                        },
                        '',
                    );
                } else if (data.status === 'failed') {
                    this.completeUploadStatus(
                        {
                            ...uploadParam,
                        },
                        '',
                    );
                    if (!row) {
                        this.updateData(uploadParam, callback1);
                    }
                }
            });
        },
        updateData(uploadParam, callback1) {
            const routeParam = this.$route.params;
            console.log(uploadParam, routeParam, 'routeParam111');
            if (
                uploadParam.fileFolderId === 'none'
                && uploadParam.currentRouteParam.chapterId
                    === routeParam.chapterId
                && uploadParam.currentRouteParam.fileFolderId
                    === routeParam.fileFolderId
                && uploadParam.currentRouteParam.resType === routeParam.resType
            ) {
                this.openMainSpin(true);
                // 如果是一级文件上传
                this.renameResFileReset(callback1);
            } else if (
                uploadParam.currentRouteParam.chapterId
                    === routeParam.chapterId
                && uploadParam.currentRouteParam.fileFolderId
                    === routeParam.fileFolderId
                && uploadParam.currentRouteParam.resType === routeParam.resType
            ) {
                this.openMainSpin(true);
                this.renameFolderFileReset(callback1);
            }
        },
        // 文件类型下的文件被重命名后重新请求
        renameFolderFileReset(callback1) {
            const p = new Promise((resolve) => {
                console.log(this.fileFolderId, 'this.fileFolderId44');
                resolve(
                    this.getResFileFolderResByFileFolderId(this.fileFolderId),
                );
            });
            p.then((ret) => {
                const arr = [...ret];
                arr.sort((a, b) => b.AddTime - a.AddTime);
                this.data1 = [...this.folder, ...arr];
                // eslint-disable-next-line no-unused-expressions
                callback1 && callback1(this.data1);
                setTimeout(() => {
                    this.openMainSpin(false);
                    this.addEventListener1();
                }, 500);
            }).catch(() => {
                this.openMainSpin(false);
            });
        },
        // 资源类型下的文件重命名，删除后，重新请求
        renameResFileReset(callback1) {
            const p = new Promise((resolve) => {
                resolve(
                    this.handleGetResList({
                        type: 2,
                        resType: this.resType,
                        chapterId: this.chapterId,
                        page: 'detail',
                    }),
                );
            });
            p.then((ret) => {
                const arr = [...ret, ...this.myCollectData];
                arr.sort((a, b) => b.AddTime - a.AddTime);
                this.data1 = [...this.folder, ...arr];
                // eslint-disable-next-line no-unused-expressions
                callback1 && callback1(this.data1);
                setTimeout(() => {
                    this.openMainSpin(false);
                    this.addEventListener1();
                }, 500);
            }).catch(() => {
                this.openMainSpin(false);
            });
        },
        addResourcFunction(uploadParam, callback1) {
            this.addResource(
                {
                    ...uploadParam,
                    fileSize: uploadParam.totalBytes,
                    fileFolderId:
                        uploadParam.fileFolderId === 'none'
                            ? ''
                            : uploadParam.fileFolderId,
                },
                ({ data }) => {
                    console.log(data, 'dataooo');
                    // 将resid添加到completeItem中
                    this.completeUploadStatus(
                        uploadParam,
                        String(data.resId[0]),
                    );
                    this.updateData(uploadParam, callback1);
                },
            );
        },
        handleGetResList({
            type, resType, chapterId, page,
        }, callback) {
            // console.log(this.$route);
            const params = {
                wdSiteId: this.current.wdSiteId, // 伟东学校/机构id 1100001000000093541
                wdStageId: this.current.wdStageId, // 学段
                wdSubjectId: this.current.wdSubjectId, // 学科
                versionId: this.current.versionId, // 版本 id
                fasId: this.current.fasId, // 分册 id
                chapBranId: chapterId || '', // 章节
                resType: resType || '', // 资源类型（必填项
                type, // 类型 1 云端-2 我上传的-3 我收藏的（必填项
                wdUserId: type === 1 ? '' : this.userInfo.loginid, // 当 type 为 2 或 3 时必传
                sort: 'AddTime_desc', // {字段}_{顺序} 如：AddTime_desc，默认值AddTime_desc
                limit: 100,
                chapRelation: 0,
            };
            const apii = {
                1: 'getResList',
                2: 'getResList',
                3: 'searchResList',
            };
            // return api
            //     .getResList(params)
            return api[apii[type]](params)
                .then(({ data }) => {
                    const result = [];
                    if (type === 2) {
                        // 我上传的
                        this.myUploadData = data.data.filter((item) => {
                            if (item.CheckStatus !== 5) {
                                return item;
                            }
                            return false;
                        });
                        return this.myUploadData;
                    }
                    if (type === 3) {
                        // 我收藏的
                        this.collectList = [];
                        this.myCollectData = data.data.map((item) => {
                            // eslint-disable-next-line no-param-reassign
                            item.collect = true;
                            this.collectList.push(item.ResId);
                            return item;
                        });
                        if (page === 'detail') {
                            this.setCollectList(this.collectList);
                        }
                        // eslint-disable-next-line no-unused-expressions
                        callback && callback();
                        return this.myCollectData;
                    }
                    if (type === 1) {
                        // 云端的
                        this.cloudData = data.data;
                        setTimeout(() => {
                            this.openMainSpin(false);
                            this.addEventListener2();
                        }, 100);
                        return this.cloudData;
                    }
                    return result;
                })
                .catch(() => {
                    this.openMainSpin(false);
                });
        },
        // 上传完成后，持久化到本地
        completeUploadStatus(uploadParam, ResId) {
            const { downloadItems } = store.state.app;
            // 上传完成
            // eslint-disable-next-line no-param-reassign
            uploadParam = {
                ...uploadParam,
                time: getDate(),
                ResId,
            };
            db.completeItem.remove(
                { uploadTimestamp: uploadParam.uploadTimestamp },
                // eslint-disable-next-line consistent-return
                (err, numRemoved) => {
                    console.log(numRemoved, 'numRemoved11');
                    if (err) {
                        return console.error(err);
                    }
                    db.completeItem.insert([uploadParam], (err) => {
                        if (err) {
                            return console.error(err);
                        }
                        return true;
                    });
                },
            );
            downloadItems.forEach((item, index) => {
                // 注意不能够用名字做区分，否则会吧之前所有名字相同的都更新，出现多条下载记录，后期改，
                if (item.uploadTimestamp === uploadParam.uploadTimestamp) {
                    store.commit('setDownloadItems', {
                        index,
                        item: uploadParam,
                    });
                }
            });
        },
        // 更新上传进度
        updateUploadStatus(uploadParam, row) {
            const { downloadItems } = store.state.app;
            if (
                uploadParam.status === 'completed'
                || uploadParam.status === 'failed'
            ) {
                this.$Message.info(
                    `${uploadParam.name}上传${
                        uploadParam.status === 'completed' ? '完成' : '失败'
                    }`,
                );
                this.uploadNum = this.uploadNum === 0 ? 0 : (this.uploadNum -= 1);
                setTimeout(() => {
                    this.checkisUploadWait();
                }, 1000);
                if (row) {
                    // eslint-disable-next-line no-param-reassign
                    row.onuploading = row.onuploading === 0 ? 0 : (row.onuploading -= 1);
                }
            }
            downloadItems.forEach((item, index) => {
                // 注意不能够用名字做区分，否则会吧之前所有名字相同的都更新，出现多条下载记录，后期改，
                if (item.uploadTimestamp === uploadParam.uploadTimestamp) {
                    store.commit('setDownloadItems', {
                        index,
                        item: uploadParam,
                    });
                }
            });
        },
        addUploadQueue(file, preDisplay) {
            const regexAll = /[^\\]*\.(\w+)$/;
            const filenames = file.name.match(regexAll);
            const extension = filenames[1];
            const renameFile = new File([file], `${uuidv4()}.${extension}`, {
                type: file.type,
            });
            const { downloadItems } = store.state.app;
            const { resType } = this;
            const result = downloadItems.filter(
                item => item.name === file.name && item.status === 'downloading',
            );
            if (result.length > 0) {
                this.$Message.info(`${file.name}正在上传`);
                return;
            }
            if (preDisplay) {
                this.data1.unshift({
                    Name: file.name,
                    AddTime: new Date().getTime() / 1000,
                    fileSize: formateFileSize(file.size),
                    uploading: true,
                    Suffix: getSuffix(file.name),
                });
            }
            const uploadTimestamp = new Date().getTime();
            const uploadParam = {
                wdStageId: this.current.wdStageId, // 学段
                wdSubjectId: this.current.wdSubjectId, // 学科
                versionId: this.current.versionId, // 版本 id
                fasId: this.current.fasId, // 分册 id
                chapBranId: this.current.chapterId, // 章节
                way: JSON.parse(JSON.stringify(this.$store.state.app.way)),
                name: file.name,
                type: 'upload',
                uploadTimestamp,
                resType,
                fileName: renameFile.name,
            };
            store.commit('setDownloadItems', {
                index: downloadItems.length,
                item: {
                    ...uploadParam,
                    status: 'pending',
                },
            });
            console.log(this.fileFolderId, 'this.fileFolderId11');
            this.uploadQueue.push({
                ...uploadParam,
                body: renameFile,
                path: file.path,
                fileFolderId: this.fileFolderId,
                currentRouteParam: { ...this.$route.params },
            });
        },
        openFolder() {
            this.$refs.file.click();
        },
    },
};
