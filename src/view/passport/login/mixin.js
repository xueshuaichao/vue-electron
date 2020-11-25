export default {
    methods: {
        loginSuccess({ data }) {
            this.errorMsg = '';
            if (data.identity.indexOf('04') < 0) {
                this.$Message.error('该账户暂无权限登录此系统!');
                return;
            }
            try {
                const { userorg, userrole } = data;
                const userOrgInfo = userorg.find(v => v.identity === '04');
                const userRoleInfo = userrole.find(v => v.role_code === '04');

                this.$store
                    .dispatch('selectUserType', {
                        userType: '04',
                        roleId: userRoleInfo.role_id,
                        roleCode: userRoleInfo.role_code,
                        roleName: userRoleInfo.role_name,
                        orgId: userOrgInfo.org_id,
                    })
                    .then(({ data }) => {
                        this.$store.commit('setLoginInfo', data);
                        this.$router.push('/');
                        this.$current.setSize(1200, 600);
                        this.$current.center();
                        this.loading = false;
                    })
                    .catch(() => {
                        this.loading = false;
                        this.$Message.error('该账户暂无权限登录此系统!');
                    });
            } catch (e) {
                this.loading = false;
                this.$Message.error('该账户暂无权限登录此系统!');
            }
        },
    },
};
