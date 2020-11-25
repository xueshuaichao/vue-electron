import Main from '@/components/main';
import upload from './upload';
import error from './error';
import passport from './passport';

// import home from './home';

export default [
    {
        name: 'home',
        path: '/',
        component: Main,
        children: [
            {
                name: 'HomeIndex',
                path: '/',
                component: () => import('@/view/home/index.vue'),
            },
            {
                name: 'HomeDetail',
                path: '/detail/:chapterId/:resType/:fileFolderId',
                component: () => import('@/view/home/detail.vue'),
                beforeEnter(to, from, next) {
                    console.log(to, 'beforeEnter');
                    next();
                },
            },
        ],
    },
    upload,
    ...error,
    ...passport,
];
