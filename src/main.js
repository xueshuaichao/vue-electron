import Vue from 'vue';

import './libs/iview';

import App from './app.vue';
import router from './router';
import store from './store';
import i18n from './locale';
import config from './config';

import './plugin/index';

import './app.less';

Vue.config.productionTip = process.env.NODE_ENV === 'development';

/**
 * @description 全局注册应用配置
 */
Vue.prototype.$config = config;

new Vue({
    router,
    store,
    i18n,
    render: h => h(App),
}).$mount('#wdc-app');
