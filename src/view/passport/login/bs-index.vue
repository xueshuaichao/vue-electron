<template>
    <div class="app-wrapper">
        <div class="app-login bs-login">
            <login-header name="bs" />
            <div class="container">
                <img
                    class="wdcloud"
                    src="../../../assets/images/passport/banner.png"
                    alt=""
                >
                <login-form name="bs" />
            </div>
        </div>
    </div>
</template>

<script>
import LoginHeader from './components/header.vue';
import LoginForm from './components/index.vue';
import './index.less';

export default {
    name: 'BigScreenLogin',
    components: {
        LoginHeader,
        LoginForm,
    },
};
</script>
