<template>
    <div class="login-form">
        <Tabs value="account">
            <TabPane
                label="账号登录"
                name="account"
            >
                <w-form :name="name" />
            </TabPane>
            <TabPane
                label="扫码登录"
                name="qrcode"
            >
                <div
                    v-if="bindPhone"
                    id="qrcode_container"
                />
                <w-form
                    v-else
                    type="bind"
                    :weixin-mes="weixinMes"
                />
            </TabPane>
        </Tabs>
    </div>
</template>

<script>
/* eslint-disable no-undef */
import { ipcRenderer } from 'electron';
import { parse } from 'querystring';
import api from '@/api/passport';
import form from './form.vue';
import util from './coverWechatCss';
import mixin from '../mixin';

export default {
    name: 'LoginForm',
    components: {
        'w-form': form,
    },
    mixins: [mixin],
    props: {
        name: {
            type: String,
            default: 'pc',
        },
    },
    data() {
        return {
            bindPhone: true,
            weixinMes: {},
        };
    },
    mounted() {
        this.initQRcode();
        ipcRenderer.on('weixin-login', (event, params) => {
            const url = new URL(params);
            this.handleLoginOfQRcode(parse(url.search.substring(1)));
        });
    },

    methods: {
        initQRcode() {
            const url = encodeURI(
                'http://passport.wdyedu.com/api/v1.2/account/wxLoginCallback',
            );
            // eslint-disable-next-line no-unused-vars
            util.coverWechatCss((result) => {
                // eslint-disable-next-line no-unused-vars
                const obj = new WxLogin({
                    self_redirect: true,
                    id: 'qrcode_container',
                    appid: 'wxe9a0d01d3de18b3a',
                    scope: 'snsapi_login',
                    redirect_uri: url,
                    state: 'http://passport.test.wdyclass.com',
                    style: '',
                    href: result,
                });
            }, this.name);
        },
        handleLoginOfQRcode(data) {
            if (data.errorCode === '10010') {
                // 需要绑定账号
                this.weixinMes = data;
                this.bindPhone = false;
            } else if (data.errorCode === '0') {
                this.weixinLogin(data);
            }
        },
        weixinLogin(data) {
            const {
                loginid, nickname, userkey, role, bizid,
            } = data;
            api.loginCallBack({
                loginid,
                userkey,
                name: nickname,
                role,
                bizid,
            }).then(this.loginSuccess);
        },
    },
};
</script>
