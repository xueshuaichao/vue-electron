/**
 * @file
 * @author tanghao
 * @date 2019-06-19
 */

import Vue from 'vue';
import Vuex from 'vuex';
import app from './module/app';
import textbook from './module/textbook';
import user from './module/user';
import cloud from './module/cloud';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        //
        abc: 'sdfs',
    },
    mutations: {
        //
    },
    actions: {
        //
    },
    modules: {
        app,
        textbook,
        user,
        cloud,
    },
});
