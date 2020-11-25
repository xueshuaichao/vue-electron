<template>
    <spin
        v-if="openSpin"
        fix
    >
        <icon
            type="ios-loading"
            size="24"
            class="demo-spin-icon-load"
        />
        <p class="spin-tips">
            {{ mainSpinText }}
        </p>
    </spin>
</template>

<script>
export default {
    name: 'LoadingSpin',
    components: {},
    data() {
        console.log('init  ....');
        return {
            currentPage: '',
            isMax: true,
        };
    },
    computed: {
        openSpin() {
            return this.$store.state.app.openMainSpin;
        },
        mainSpinText() {
            return this.$store.state.app.mainSpinText;
        },
    },
    mounted() {},
    methods: {},
};
</script>

<style lang="less"></style>
