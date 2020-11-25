import Vue from 'vue';
import VueI18n from 'vue-i18n';
import zhCnLocale from 'iview/src/locale/lang/zh-CN';
import enUsLocale from 'iview/src/locale/lang/en-US';
import customZhCn from './lang/zh-cn/index';
import customEnUs from './lang/en-us/index';

Vue.use(VueI18n);

// 自动根据浏览器系统语言设置语言
// const navLang = navigator.language
// const localLang = (navLang === 'zh-CN' || navLang === 'en-US') ? navLang : false
// let lang = window.localStorage.lang || localLang || 'zh-CN'
const lang = 'zh-CN';

// Vue.config.lang = lang;

Vue.locale = () => {};
const messages = {
    'zh-CN': Object.assign(zhCnLocale, customZhCn),
    'en-US': Object.assign(enUsLocale, customEnUs),
};

export default new VueI18n({
    locale: lang,
    messages,
});
