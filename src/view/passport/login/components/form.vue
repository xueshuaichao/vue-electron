<template>
    <i-form
        ref="form"
        :model="form"
        :rules="rules"
    >
        <p
            v-if="type === 'bind'"
            class="tip"
        >
            hi，{{
                weixinMes.nickname
            }}，系统检测到您还未绑定账号，完成绑定后就可以使用微信扫码登录喽~
        </p>
        <form-item
            v-click-outside="handleHide"
            prop="uname"
        >
            <i-input
                v-model.trim="form.uname"
                :placeholder="unamePlaceholder"
                @on-focus="handleShow"
                @on-change="handleChange"
            />
            <div
                v-show="showDropdown && accountInfo.length"
                class="ivu-select-dropdown"
            >
                <ul class="ivu-select-dropdown-list">
                    <li
                        v-for="(item, index) in accountInfo"
                        :key="index"
                        class="ivu-select-item"
                        @click="handleSetAccount(index)"
                    >
                        {{ item.uname }}
                    </li>
                </ul>
            </div>
        </form-item>
        <form-item
            prop="upwd"
            :class="[
                type === 'bind' ? 'margin' : '',
                name === 'bs' ? 'upwd' : ''
            ]"
        >
            <i-input
                v-model.trim="form.upwd"
                type="password"
                placeholder="请输入密码"
            />
        </form-item>
        <form-item
            v-if="name === 'pc' && type !== 'bind'"
            class="forget-password"
        >
            <Checkbox v-model="rpwd">
                记住密码
            </Checkbox>
            <a
                href="javascript:void(0)"
                @click="openUrl"
            >忘记密码?</a>
        </form-item>
        <div
            v-if="errorMsg"
            class="error"
        >
            {{ errorMsg }}
        </div>
        <i-button
            type="primary"
            long
            :loading="loading"
            @click="handleLogin"
        >
            {{ type ? "立即绑定" : "登录" }}
        </i-button>
    </i-form>
</template>

<script>
/* eslint-disable no-undef */
import api from '@/api/passport';
import config from '@/config/index';
import { clickOutside } from '@/directives/index';
import { am } from '../account';
import mixin from '../mixin';

export default {
    name: 'LoginForm',
    directives: {
        clickOutside,
    },
    mixins: [mixin],
    props: {
        name: {
            type: String,
            default: 'pc',
        },
        type: {
            type: String,
            default: '',
        },
        weixinMes: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    data() {
        return {
            loading: false,
            rpwd: '',
            loginRegion: config.LOGIN_REGION,
            unamePlaceholder: '',
            validLoginNumber: 4,
            accountInfo: [],
            showDropdown: false,
            accountLock: false,
            errorMsg: '',
            form: {
                uname: '',
                upwd: '',
            },
            rules: {
                uname: [
                    {
                        required: true,
                        message: '请输入账号/手机号/邮箱',
                        trigger: 'change',
                    },
                ],
                upwd: [
                    { required: true, message: '请输入密码', trigger: 'change' },
                ],
            },
        };
    },
    created() {
        this.setPlaceholder();
        if (this.type === 'bind') return;
        am.getAccountInfo().then(({ account, status }) => {
            this.accountInfo = account;
            this.rpwd = status;

            if (account.length) {
                this.form = {
                    ...account[account.length - 1],
                };
            }
        });
    },
    methods: {
        openUrl() {
            this.$shell.openExternal('https://passport.wdyedu.com/forget');
        },
        setPlaceholder() {
            const placeholderMap = {
                '01': '请输入账号/手机号/邮箱',
                '02': '用户名/手机号/邮箱/身份证号',
            };

            this.unamePlaceholder = placeholderMap[this.loginRegion];
        },
        handleBindAccount() {
            this.loading = true;
            api.bindAndLogin({ openid: this.weixinMes.openid, ...this.form })
                .then(this.loginSuccess)
                .catch(({ data }) => {
                    this.loading = false;
                    this.errorMsg = data;
                });
        },
        handleLogin() {
            if (this.accountLock) return;
            this.$refs.form.validate((res) => {
                if (res) {
                    if (this.type === 'bind') {
                        this.handleBindAccount();
                    } else {
                        this.submit();
                    }
                }
            });
        },
        handleSetAccount(index) {
            this.form = { ...this.accountInfo[index] };
            this.handleHide();
        },
        handleShow() {
            if (this.showDropdown) {
                return;
            }
            this.showDropdown = true;
        },
        handleHide() {
            this.showDropdown = false;
        },
        handleChange() {
            const isHas = this.accountInfo.find(v => v.uname.startsWith(this.form.uname));

            if (!isHas) {
                this.handleHide();
            } else {
                this.handleShow();
            }
        },
        submit() {
            this.loading = true;
            api.login({
                loginType: 'DAPING',
                ...this.form,
            })
                .then((res) => {
                    if (this.rpwd) {
                        am.save(this.form);
                    } else {
                        am.setAccountStatus(false);
                    }
                    this.loginSuccess(res);
                })
                .catch((res) => {
                    this.hanldeLoginFail(res);
                    this.loading = false;
                });
        },
        hanldeLoginFail({ code }) {
            const { validLoginNumber: num } = this;
            if (code === '03') {
                this.errorMsg = '用户名或密码错误，请重新输入！';
            } else if (code === '05' || code === '04') {
                this.errorMsg = `用户名或密码错误，您还可以尝试${num}次`;
                this.validLoginNumber = num - 1;

                if (num <= 0) {
                    this.handleAccountLock();
                }
            }
        },

        // 账户锁定5分钟
        handleAccountLock() {
            this.accountLock = true;
            this.errorMsg = '密码错误次数过多，您的账户被锁定5分钟';
            setTimeout(() => {
                this.accountLock = false;
                this.validLoginNumber = 4;
                this.errorMsg = '';
            }, 1000 * 60 * 5);
        },
    },
};
</script>
