/**
 * @des cloud store
 *
 */
export default {
    state: {
        filtersList: {
            stageList: [],
            subjectList: [],
            versionList: [],
            fascicleList: [],
            moduleList: [],
        },
        collectList: [],
    },
    getters: {
        filtersList(state) {
            return state.filtersList;
        },
        collectList(state) {
            return state.collectList;
        },
    },
    mutations: {
        setFiltersList(state, info) {
            state.filtersList = {
                ...state.filtersList,
                ...info,
            };
        },
        setCollectList(state, data) {
            state.collectList = data;
        },
    },
};
