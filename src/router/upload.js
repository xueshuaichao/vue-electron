/**
 * @file
 * @author tanghao
 * @date 2019-06-19
 */
import Upload from '@/components/upload';

export default {
    name: 'upload',
    path: '/',
    component: Upload,
    children: [
        {
            name: 'upload',
            path: '/upload',
            component: () => import('@/view/upload/upload.vue'),
        },
        {
            name: 'download',
            path: '/download',
            component: () => import('@/view/upload/download.vue'),
        },
        {
            name: 'complete',
            path: '/complete',
            component: () => import('@/view/upload/complete.vue'),
        },
    ],
};
