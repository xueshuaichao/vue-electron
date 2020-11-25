/**
 * @des 登录
 */
import PcLogin from '@/view/passport/login/index.vue';
import BigScreenLogin from '@/view/passport/login/bs-index.vue';

export default [
    {
        path: '/login', // pc登录
        name: 'pclogin',
        component: PcLogin,
    },
    {
        path: '/bs-login', // 大屏登录
        name: 'bigScreenlogin',
        component: BigScreenLogin,
    },
];
