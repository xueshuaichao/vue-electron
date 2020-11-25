<template>
    <div>
        <i-button
            size="large"
            type="text"
            @click="backHome"
        >
            返回首页
        </i-button>
        <i-button
            size="large"
            type="text"
        >
            返回上一页({{ second }}s)
        </i-button>
    </div>
</template>

<script>
import './error.less';

export default {
    name: 'BackBtnGroup',
    data() {
        return {
            second: 5,
            timer: null,
        };
    },
    mounted() {
        this.timer = setInterval(() => {
            if (this.second === 0) {
                this.backPrev();
            } else {
                this.second -= 1;
            }
        }, 1000);
    },
    beforeDestroy() {
        clearInterval(this.timer);
    },
    methods: {
        backHome() {
            this.$router.replace({
                name: 'HomeIndex',
            });
        },
        backPrev() {
            this.$router.go(-1);
        },
    },
};
</script>
