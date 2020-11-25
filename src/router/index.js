import Vue from 'vue';
import iView from 'iview';
import Router from 'vue-router';
import routes from './routers';

const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err);
};

Vue.use(Router);

const router = new Router({
    mode: 'hash',
    routes,
});

router.afterEach(() => {
    iView.LoadingBar.finish();
    window.scrollTo(0, 0);
});

export default router;
