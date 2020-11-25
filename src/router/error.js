/**
 * @file
 * @author tanghao
 * @date 2018/8/2
 */
export default [
    {
        path: '/401',
        name: 'error_401',
        component: () => import('../view/error/401.vue'),
    },
    {
        path: '/500',
        name: 'error_500',
        component: () => import('../view/error/500.vue'),
    },
    {
        path: '*',
        name: 'error_404',
        component: () => import('../view/error/404.vue'),
    },
];
