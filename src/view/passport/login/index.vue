<template>
    <div class="app-login pc-login">
        <login-header name="pc" />
        <div class="container flex-row">
            <img
                class="wdcloud"
                src="../../../assets/images/passport/wdcloud.png"
                alt=""
            >
            <login-form
                ref="form"
                name="pc"
            />
        </div>
    </div>
</template>

<script>
import LoginHeader from './components/header.vue';
import LoginForm from './components/index.vue';
import './index.less';

export default {
    name: 'PcLogin',
    components: {
        LoginHeader,
        LoginForm,
    },
};
</script>
