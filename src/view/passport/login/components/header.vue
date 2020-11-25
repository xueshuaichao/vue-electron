<template>
    <div class="header flex-row">
        <img
            class="logo"
            :src="
                require('../../../../assets/images/passport/logo-' +
                    name +
                    '.png')
            "
            alt=""
        >
        <div class="toolbar flex-row">
            <div
                class="item"
                @click="$current.minimize()"
            >
                <img
                    src="../../../../assets/images/passport/pop_mini@2x.png"
                    alt=""
                >
            </div>
            <!-- <div
                class="item"
                @click="$current.close()"
            >
                <img
                    src="../../../../assets/images/passport/pop_cancle@2x.png"
                    alt=""
                >
            </div> -->
            <div
                class="item"
                @click="$ipcRenderer.send('win-close')"
            >
                <img
                    src="../../../../assets/images/passport/pop_cancle@2x.png"
                    alt=""
                >
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'LoginHeader',
    props: {
        name: {
            type: String,
            default: 'pc',
        },
    },
};
</script>
