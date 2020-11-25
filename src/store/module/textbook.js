/* eslint-disable import/no-cycle */
/* eslint-disable arrow-body-style */
/* eslint-disable prefer-destructuring */
import Vue from 'vue';
import api from '../../api/textbook';
import resourceApi from '../../api/resources';
import db from '../../database';

// const createDatabasePlugin = function (database) {
//     return store => {

//     }
// };

let siteId = '';

function asyncInsertBook(localBook) {
    return new Promise((resolve) => {
        // save back to localBookList
        db.textbook.insert(localBook, (err, newDoc) => {
            // Callback is optional
            // newDoc is the newly inserted document, including its _id
            // newDoc has no key called notToBeSaved since its value was undefined
            if (err) {
                console.error(err);
            }
            // console.log(newDoc);
            resolve(newDoc);
            // merge to localBookList
            // localBookList.push(newDoc);
        });
    });
}

export default {
    state: {
        uid: '',
        chapterAsyncData: [],

        current: {},
        underSelect: {
            stageId: '120000',
            subjectId: '122600',
            versionId: '83',
            fasId: '192',
        },
        options: {
            stage: [],
            subject: [],
            version: [],
            fascicle: [],
        },
        textbooks: [],
        resTypeList: [],
        resTypeId: '',
    },
    getters: {
        current(state) {
            const {
                stageId,
                subjectId,
                versionId,
                fasId,
                resType,
            } = state.current;
            return {
                wdSiteId: siteId,
                wdStageId: stageId,
                wdSubjectId: subjectId,
                versionId,
                fasId,
                resType,
            };
        },
        curTextbook(state) {
            const {
                stageId,
                subjectId,
                versionId,
                fasId,
                chapterId,
            } = state.current;
            return {
                wdSiteId: siteId,
                wdStageId: stageId,
                wdSubjectId: subjectId,
                versionId,
                fasId,
                chapterId,
            };
        },
        underSelect(state) {
            const {
                stageId,
                subjectId,
                versionId,
                fasId,
                menuOpenNames,
            } = state.underSelect;
            return {
                wdSiteId: siteId,
                wdStageId: stageId,
                wdSubjectId: subjectId,
                versionId,
                fasId,
                menuOpenNames,
            };
        },
        options(state) {
            return state.options;
        },
    },
    mutations: {
        initialize(state, { uid, books }) {
            state.uid = uid;
            state.textbooks = books;
            const activedBook = books.find(item => item.isActive === true);

            if (activedBook) {
                state.current = activedBook;
            } else if (books.length) {
                [state.current] = books;
            }
        },
        SELECT_TEXTBOOK(state, index) {
            state.current = state.textbooks[index];
        },
        ADD_TEXT_BOOK(state, textbook) {
            console.log(textbook);
            state.textbooks.push(textbook);
            state.current = textbook;
        },
        selectStage(state, stageId) {
            Vue.set(state.underSelect, 'stageId', stageId);
            Vue.set(state.underSelect, 'subjectId', '');
            Vue.set(state.underSelect, 'versionId', '');
            Vue.set(state.underSelect, 'fasId', '');
        },
        selectSubject(state, subjectId) {
            Vue.set(state.underSelect, 'subjectId', subjectId);
            Vue.set(state.underSelect, 'versionId', '');
            Vue.set(state.underSelect, 'fasId', '');
        },
        selectVersion(state, versionId) {
            Vue.set(state.underSelect, 'versionId', versionId);
            Vue.set(state.underSelect, 'fasId', '');
        },
        selectFascicle(state, fascileId) {
            Vue.set(state.underSelect, 'fasId', fascileId);
        },
        SELECT_CHAPTER(state, chapterId) {
            // Vue.set(state.current, 'chapterId', chapterId);
            // console.log(state.current);
            state.current.chapterId = chapterId;
            state.current = Object.assign({}, state.current, { chapterId });
        },
        SAVE_WAY(state, way) {
            state.current.way = way;
            state.current = Object.assign({}, state.current, { way });
        },
        SET_RES_TYPE_ID(state, resTypeId) {
            if (resTypeId) {
                state.resTypeId = `${state.current.chapterId}_${resTypeId}`;
                state.current.resTypeId = resTypeId;
                state.current = Object.assign({}, state.current, {
                    resType: resTypeId,
                });
            } else {
                state.resTypeId = '';
                state.current.resType = '';
                state.current = Object.assign({}, state.current, {
                    resType: '',
                });
            }
        },
        OPEN_MENU(state, arrMenuOpenNames) {
            state.current.menuOpenNames = arrMenuOpenNames;
            state.current = Object.assign({}, state.current, {
                menuOpenNames: arrMenuOpenNames,
            });
            console.log(state.current);
        },
        SET_MENU_SCROLL_TOP(state, val) {
            state.current.menuScrollTop = val;
            state.current = Object.assign({}, state.current, {
                menuScrollTop: val,
            });
        },
        GET_RES_TYPE_LIST_ASYNC(state, data) {
            Vue.set(state, 'resTypeList', data);
        },
        GET_CHAPTER_ASYNC(state, data) {
            Vue.set(state, 'chapterAsyncData', data);
            // state.chapterAsyncData = Object.assign({}, data);
        },
        GET_OPTION_STAGE(state, data) {
            Vue.set(state.options, 'stage', data);
        },
        GET_OPTION_SUBJECT(state, data) {
            Vue.set(state.options, 'subject', data);
        },
        GET_OPTION_VERSION(state, data) {
            Vue.set(state.options, 'version', data);
        },
        GET_OPTION_FASCICLE(state, data) {
            Vue.set(state.options, 'fascicle', data);
        },
    },
    actions: {
        initializeTextbook(store, params) {
            const { uid } = params;
            siteId = params.user_org.find(v => v.identity === '04').school_id;
            // ().then((res) => {
            //     const userBookList = res.data;
            //     console.log(userBookList);
            // });
            function loadLocalBooks() {
                return new Promise((resolve) => {
                    db.textbook.find(
                        {
                            uid,
                        },
                        (err, docs) => {
                            resolve(docs);
                        },
                    );
                });
            }
            return new Promise((resolve) => {
                Promise.all([api.getList(), loadLocalBooks()]).then((data) => {
                    const userBookList = data[0].data;
                    const localBookList = data[1];

                    console.log('===> need merge ===>:', localBookList.length);
                    console.log(userBookList, localBookList);

                    const needInsertBookList = [];
                    userBookList.forEach((remoteBook) => {
                        // eslint-disable-next-line arrow-body-style
                        if (
                            !localBookList.find(
                                localBook => localBook.fasId === remoteBook.fasId,
                            )
                        ) {
                            const localBook = {
                                uid: uid.toString(),
                                stageId: remoteBook.wdStageId,
                                subjectId: remoteBook.wdSubjectId,
                                versionId: remoteBook.versionId,
                                fasId: remoteBook.fasId,
                                chapterId: '',
                                label: remoteBook.label,
                                menuOpenNames: [],
                            };
                            needInsertBookList.push(localBook);
                        }
                    });

                    Promise.all(
                        needInsertBookList.map((book) => {
                            return asyncInsertBook(book);
                        }),
                    ).then((data) => {
                        const bookList = localBookList.concat(data);

                        bookList.forEach((localBook) => {
                            if (!localBook.menuOpenNames) {
                                // eslint-disable-next-line no-param-reassign
                                localBook.menuOpenNames = [];
                                db.textbook.update(
                                    // eslint-disable-next-line no-underscore-dangle
                                    { _id: localBook._id },
                                    { $set: { menuOpenNames: [] } },
                                    () => {},
                                );
                            }
                        });

                        store.commit('initialize', {
                            uid,
                            books: bookList,
                        });
                        if (bookList.length) {
                            store.dispatch('getChapterAsync');
                        }
                        console.log('start =========>>>>>');
                        console.log(bookList);
                        resolve();
                    });
                });
            });
        },
        selectTextbook(store, index) {
            const textbook = store.state.textbooks[index];
            db.textbook.update(
                { isActive: true },
                { $set: { isActive: false } },
                () => {
                    db.textbook.update(
                        { _id: textbook._id },
                        { $set: { isActive: true } },
                        () => {
                            store.commit('SELECT_TEXTBOOK', index);
                            store.dispatch('getChapterAsync');
                        },
                    );
                },
            );
        },
        addTextbook(store, config) {
            const { state } = store;
            console.log(state.uid);
            const textbook = {
                stageId: config.stageId.toString(),
                subjectId: config.subjectId.toString(),
                versionId: config.versionId.toString(),
                fasId: config.fascicleId.toString(),
                isActive: true,
                uid: state.uid.toString(),
                menuOpenNames: [],
                chapterId: '',
            };

            const label = `${
                state.options.stage.find(
                    item => item.wdStageId.toString() === textbook.stageId,
                ).stageName
            } ${
                state.options.subject.find(
                    item => item.wdSubjectId.toString() === textbook.subjectId,
                ).subjectName
            } ${
                state.options.version.find(
                    item => item.id.toString() === textbook.versionId,
                ).name
            } ${
                state.options.fascicle.find(
                    item => item.id.toString() === textbook.fasId,
                ).name
            }`;
            textbook.label = label;

            function addSuccess() {
                // 本地已经添加，忽略
                if (
                    state.textbooks.find(item => item.fasId === textbook.fasId)
                ) {
                    return false;
                }
                return db.textbook.update(
                    { isActive: true },
                    { $set: { isActive: false } },
                    () => {
                        db.textbook.insert(textbook, (err, doc) => {
                            // Callback is optional
                            // newDoc is the newly inserted document, including its _id
                            // newDoc has no key called notToBeSaved since its value was undefined
                            if (err) {
                                return console.error(err);
                            }
                            store.commit('ADD_TEXT_BOOK', doc);
                            store.dispatch('getChapterAsync');
                            return true;
                        });
                    },
                );
            }
            // console.log(chapterAsyncData);
            // set default menuOpenNames and chapterId
            // menuOpenNames: [],
            // chapterId: '',
            // return;
            const wdStageId = textbook.stageId;
            const wdSubjectId = textbook.subjectId;
            const versionId = textbook.versionId;
            const fasId = textbook.fasId;
            api.add({
                wdStageId,
                wdSubjectId,
                versionId,
                fasId,
                label,
            }).then(
                () => {
                    addSuccess();
                },
                (err) => {
                    console.log(err);
                },
            );
        },
        setResType(store, resType) {
            const textbook = store.state.current;
            store.commit('SET_RES_TYPE_ID', resType);
            db.textbook.update(
                { _id: textbook._id },
                { $set: { resType } },
                () => {},
            );
        },
        openMenu(store, arrMenuOpenNames) {
            const textbook = store.state.current;
            console.log('====>');
            console.log(arrMenuOpenNames);
            db.textbook.update(
                { _id: textbook._id },
                { $set: { menuOpenNames: arrMenuOpenNames } },
                () => {
                    store.commit('OPEN_MENU', arrMenuOpenNames);
                },
            );
        },
        setMenuScrollTop(store, val) {
            const textbook = store.state.current;
            console.log(val);
            db.textbook.update(
                { _id: textbook._id },
                { $set: { menuScrollTop: val } },
                () => {
                    store.commit('SET_MENU_SCROLL_TOP', val);
                },
            );
        },
        selectChapter(store, chapterId) {
            const textbook = store.state.current;
            store.commit('SELECT_CHAPTER', chapterId);
            console.log('updatttttt');
            console.log(textbook._id);
            db.textbook.update(
                { _id: textbook._id },
                { $set: { chapterId } },
                (err) => {
                    if (err) {
                        console.log(err);
                    }
                },
            );
        },
        saveWay(store, way) {
            const textbook = store.state.current;
            store.commit('SAVE_WAY', way);
            db.textbook.update(
                { _id: textbook._id },
                { $set: { way } },
                () => {},
            );
        },
        getChapterAsync(store) {
            Promise.all([
                api.getChapter(store.getters.current),
                resourceApi.getModuleList({ modId: 5 }),
            ]).then((data) => {
                // const chapterAsyncData = data[0].data;
                // const menuOpenNames = getDefaultOpenMenuNames(chapterAsyncData);
                console.log(store.state.current);
                const current = store.state.current;
                const chapterData = data[0].data;
                if (!current.chapterId) {
                    console.error('no chapter ID');
                    if (chapterData.length) {
                        store.commit('SELECT_CHAPTER', data[0].data[0].id);
                    }
                }
                store.commit('GET_CHAPTER_ASYNC', data[0].data);
                store.commit('GET_RES_TYPE_LIST_ASYNC', data[1].data);
                // api.getChapter().then((res) => {
                //     store.commit('GET_CHAPTER_ASYNC', res.data);
                // });
            });
        },
        getOptionsAsync(store) {
            console.log(store.getters.current);
        },
        getStageOptionAsync(store) {
            return api.getStage(store.getters.underSelect).then((res) => {
                store.commit('GET_OPTION_STAGE', res.data);
            });
        },
        getSubjectOptionAsync(store) {
            return api.getSubject(store.getters.underSelect).then((res) => {
                store.commit('GET_OPTION_SUBJECT', res.data);
            });
        },
        getVersionOptionAsync(store) {
            return api.getVersion(store.getters.underSelect).then((res) => {
                store.commit('GET_OPTION_VERSION', res.data);
            });
        },
        getFascicleOptionAsync(store) {
            return api.getFascicle(store.getters.underSelect).then((res) => {
                store.commit('GET_OPTION_FASCICLE', res.data);
            });
        },
    },
};
