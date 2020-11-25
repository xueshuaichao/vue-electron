<template>
    <Modal
        v-model="show"
        title="安全设置"
        class="app-modal"
        footer-hide
        width="312"
    >
        <div class="bind-phone">
            <p class="tip">
                系统检测到您还未绑定手机号，为了给您更好
                的服务及方便您之后找回密码等，需要您绑定 手机号进行账号激活。
            </p>
            <i-form
                ref="form"
                v-model="form"
                :rules="rules"
                :show-message="false"
            >
                <form-item prop="phone">
                    <i-input
                        v-model="form.phone"
                        placeholder="请输入手机号"
                        :maxlength="11"
                    />
                </form-item>
                <form-item prop="verifyCode">
                    <div class="flex-row">
                        <i-input
                            v-model="form.verifyCode"
                            placeholder="请输入验证码"
                        />
                        <i-button type="primary">
                            获取验证码
                        </i-button>
                    </div>
                </form-item>
            </i-form>
            <div class="error-message">
                账户不存在
            </div>
            <i-button
                type="primary"
                long
                class="bind-btn"
                @click="handleBindPhone"
            >
                立即绑定
            </i-button>
            <p class="skip">
                跳过
            </p>
        </div>
    </Modal>
</template>

<script>
export default {
    name: 'BindPhone',
    data() {
        return {
            show: false,
            form: {
                phone: '',
                verifyCode: '',
            },
            rules: {
                phone: [
                    {
                        required: true,
                        message: '手机号',
                        trigger: 'change',
                    },
                ],
                verifyCode: [
                    { required: true, message: '请输入密码', trigger: 'change' },
                ],
            },
        };
    },
    methods: {
        handleBindPhone() {
            this.$refs.form.validate((res) => {
                console.log(res);
            });
        },
    },
};
</script>

<style lang="less">
.bind-phone {
    padding: 0 16px;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.4);
    .ivu-form-item {
        margin-bottom: 14px;
    }
    .tip {
        margin-bottom: 6px;
    }
    .skip {
        margin-top: 2px;
        text-align: center;
        &:hover {
            cursor: pointer;
        }
    }
    .error-message {
        margin-top: 30px;
        text-align: center;
        font-size: 12px;
        color: #cb3a3a;
    }
    .bind-btn {
        margin-top: 20px;
        font-size: 14px;
    }
}
</style>
