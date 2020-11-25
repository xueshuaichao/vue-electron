/**
 * @file
 * @author tanghao
 * @date 2019-06-20
 */

import Vue from 'vue';
import iView from 'iview';
import i18n from '../locale';

import '../less/iview-variables.less';

Vue.use(iView, {
    i18n: (key, value) => i18n.t(key, value),
});
